import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  deleteField,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { MIC_LINK_DB_NAME } from "@/constants/database-name";
import {
  MIC_LINK_ICE_SERVERS,
  MIC_LINK_MAX_BITRATE_KBPS,
} from "@/constants/mic-link";
import {
  MicLinkCandidate,
  MicLinkConnectionInfo,
  MicLinkQuality,
  MicLinkRoom,
  MicLinkStatus,
} from "@/interfaces/mic-link";
import { db } from "@/libs/firebase";

// WebRTC signalling over Firestore.
//
// Firestore is only a mailbox: the two devices swap an SDP offer/answer pair
// and their ICE candidates through it, then the audio itself flows directly
// between them. On a shared LAN ICE settles on "host" candidates, so the media
// never leaves the network even though the page is served from the internet.
//
// The phone (sender) is always the offerer, because its offer already carries
// the real audio track. The receiver answers, and rebuilds its peer connection
// from scratch every time a *new* offer appears — that is what lets the phone
// reconnect after a screen lock without the user rescanning the QR code.

const roomRef = (roomId: string): DocumentReference =>
  doc(db, MIC_LINK_DB_NAME, roomId);

const senderCandidatesRef = (roomId: string): CollectionReference =>
  collection(db, MIC_LINK_DB_NAME, roomId, "senderCandidates");

const receiverCandidatesRef = (roomId: string): CollectionReference =>
  collection(db, MIC_LINK_DB_NAME, roomId, "receiverCandidates");

const toCandidatePayload = (candidate: RTCIceCandidate): MicLinkCandidate => ({
  candidate: candidate.candidate,
  sdpMid: candidate.sdpMid ?? null,
  sdpMLineIndex: candidate.sdpMLineIndex ?? null,
  usernameFragment: candidate.usernameFragment ?? null,
});

const clearCollection = async (ref: CollectionReference): Promise<void> => {
  const snapshot = await getDocs(ref);
  await Promise.all(snapshot.docs.map((entry) => deleteDoc(entry.ref)));
};

export interface MicLinkHandlers {
  onStatus: (status: MicLinkStatus) => void;
  onError: (message: string) => void;
  onRemoteStream?: (stream: MediaStream) => void;
}

export interface MicLinkSession {
  getConnectionInfo: () => Promise<MicLinkConnectionInfo | null>;
  close: () => Promise<void>;
}

const statusFromConnectionState = (
  state: RTCPeerConnectionState,
): MicLinkStatus => {
  switch (state) {
    case "connected":
      return "live";
    case "failed":
      return "error";
    case "closed":
      return "closed";
    // "disconnected" is routinely transient (a wifi blip, a backgrounded tab),
    // so it is reported as still-connecting rather than as a failure.
    default:
      return "connecting";
  }
};

// Remembers every ICE candidate the other side has published, keyed by document
// id, and replays the lot into whichever peer connection is currently bound.
//
// Buffering is required in both directions: candidates routinely arrive before
// the description they belong to has been applied, and `addIceCandidate` throws
// if the peer connection has no remote description yet. Keeping the ledger
// separate from the peer connection is also what makes the receiver's rebuild
// safe, since the replay happens again against the new connection.
interface CandidateLedger {
  add: (id: string, candidate: MicLinkCandidate) => void;
  forget: (id: string) => void;
  bindTo: (peer: RTCPeerConnection) => void;
}

const createCandidateLedger = (): CandidateLedger => {
  const known = new Map<string, MicLinkCandidate>();
  let bound: RTCPeerConnection | null = null;

  const push = (candidate: MicLinkCandidate): void => {
    if (!bound?.remoteDescription) return;
    bound.addIceCandidate(new RTCIceCandidate(candidate)).catch((error) => {
      // Stale candidates from a previous negotiation land here and are
      // genuinely harmless; ICE only needs one pair to succeed.
      console.warn("[mic-link] ignored an unusable ICE candidate", error);
    });
  };

  return {
    add: (id, candidate) => {
      known.set(id, candidate);
      push(candidate);
    },
    forget: (id) => {
      known.delete(id);
    },
    bindTo: (peer) => {
      bound = peer;
      known.forEach(push);
    },
  };
};

// Holds this peer's own ICE candidates back until its description has been
// committed to Firestore. Writes from one client reach the other in commit
// order, so flushing only after the description write guarantees the remote
// side sees the description first.
interface CandidateOutbox {
  handle: (candidate: RTCIceCandidate) => void;
  flush: () => void;
}

const createCandidateOutbox = (
  target: CollectionReference,
): CandidateOutbox => {
  let pending: MicLinkCandidate[] = [];
  let isOpen = false;

  const write = (candidate: MicLinkCandidate): void => {
    addDoc(target, candidate).catch((error) => {
      console.warn("[mic-link] failed to publish an ICE candidate", error);
    });
  };

  return {
    handle: (candidate) => {
      const payload = toCandidatePayload(candidate);
      if (isOpen) write(payload);
      else pending.push(payload);
    },
    flush: () => {
      isOpen = true;
      const queued = pending;
      pending = [];
      queued.forEach(write);
    },
  };
};

const buildPeerConnection = (): RTCPeerConnection =>
  new RTCPeerConnection({
    iceServers: MIC_LINK_ICE_SERVERS,
    iceCandidatePoolSize: 4,
  });

// Caps the outgoing bitrate. Opus negotiates a sensible default on its own, but
// "hifi" needs an explicit lift to sound like anything other than a phone call.
const applyBitrateCap = async (
  peer: RTCPeerConnection,
  quality: MicLinkQuality,
): Promise<void> => {
  const sender = peer
    .getSenders()
    .find((entry) => entry.track?.kind === "audio");
  if (!sender) return;

  const parameters = sender.getParameters();
  if (!parameters.encodings || parameters.encodings.length === 0) {
    parameters.encodings = [{}];
  }
  parameters.encodings[0].maxBitrate =
    MIC_LINK_MAX_BITRATE_KBPS[quality] * 1000;
  try {
    await sender.setParameters(parameters);
  } catch (error) {
    console.warn("[mic-link] could not apply the bitrate cap", error);
  }
};

// Opus defaults to mono, voice-grade settings. For "hifi" the fmtp line has to
// be rewritten by hand — there is no API for asking for stereo Opus.
export const preferHighQualityOpus = (
  sdp: string,
  quality: MicLinkQuality,
): string => {
  if (quality !== "hifi") return sdp;
  const rtpmap = sdp.match(/a=rtpmap:(\d+) opus\/48000\/2/);
  if (!rtpmap) return sdp;

  const payloadType = rtpmap[1];
  const extras =
    "stereo=1;sprop-stereo=1;maxaveragebitrate=256000;useinbandfec=1";
  const fmtpPattern = new RegExp(`a=fmtp:${payloadType} ([^\\r\\n]*)`);

  if (fmtpPattern.test(sdp)) {
    return sdp.replace(
      fmtpPattern,
      (_match, params: string) => `a=fmtp:${payloadType} ${params};${extras}`,
    );
  }
  return sdp.replace(
    `a=rtpmap:${payloadType} opus/48000/2`,
    `a=rtpmap:${payloadType} opus/48000/2\r\na=fmtp:${payloadType} ${extras}`,
  );
};

interface MicLinkRawStat {
  id: string;
  type: string;
  state?: string;
  localCandidateId?: string;
  remoteCandidateId?: string;
  currentRoundTripTime?: number;
  bytesReceived?: number;
  candidateType?: string;
}

interface StatsCursor {
  bytes: number;
  at: number;
}

const readConnectionInfo = async (
  peer: RTCPeerConnection,
  previous: StatsCursor | null,
): Promise<{ info: MicLinkConnectionInfo; cursor: StatsCursor } | null> => {
  const report = await peer.getStats();
  const stats = Array.from(report.values()) as MicLinkRawStat[];
  const pair = stats.find(
    (stat) => stat.type === "candidate-pair" && stat.state === "succeeded",
  );
  if (!pair) return null;

  const local = stats.find((stat) => stat.id === pair.localCandidateId);
  const remote = stats.find((stat) => stat.id === pair.remoteCandidateId);
  const cursor: StatsCursor = {
    bytes: pair.bytesReceived ?? 0,
    at: Date.now(),
  };

  const elapsedSeconds = previous ? (cursor.at - previous.at) / 1000 : 0;
  const bitrateKbps =
    previous && elapsedSeconds > 0
      ? Math.max(
          0,
          Math.round(
            ((cursor.bytes - previous.bytes) * 8) / elapsedSeconds / 1000,
          ),
        )
      : undefined;

  return {
    cursor,
    info: {
      localCandidateType: local?.candidateType,
      remoteCandidateType: remote?.candidateType,
      roundTripTimeMs:
        pair.currentRoundTripTime === undefined
          ? undefined
          : Math.round(pair.currentRoundTripTime * 1000),
      bitrateKbps,
      isDirect:
        local?.candidateType === "host" && remote?.candidateType === "host",
    },
  };
};

// The receiving device (usually a desktop). Creates the room, then answers
// whatever offer the phone publishes — including a later one, so a phone that
// dropped can rejoin the same room.
export const openReceiverSession = async (
  roomId: string,
  quality: MicLinkQuality,
  handlers: MicLinkHandlers,
): Promise<MicLinkSession> => {
  const room = roomRef(roomId);
  const ledger = createCandidateLedger();

  let peer: RTCPeerConnection | null = null;
  let isClosed = false;
  let handledOfferSdp: string | null = null;
  let cursor: StatsCursor | null = null;

  const ownerToken =
    crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  await setDoc(room, { createdAt: Date.now(), quality, ownerToken });
  handlers.onStatus("waiting");

  const answerOffer = async (sdp: string): Promise<void> => {
    peer?.close();
    const next = buildPeerConnection();
    const nextOutbox = createCandidateOutbox(receiverCandidatesRef(roomId));
    peer = next;

    next.onicecandidate = (event) => {
      if (event.candidate && !isClosed) nextOutbox.handle(event.candidate);
    };
    next.ontrack = (event) => {
      handlers.onRemoteStream?.(
        event.streams[0] ?? new MediaStream([event.track]),
      );
    };
    next.onconnectionstatechange = () => {
      // Ignore a superseded connection still winding down after a rebuild.
      if (isClosed || peer !== next) return;
      handlers.onStatus(statusFromConnectionState(next.connectionState));
    };

    handlers.onStatus("connecting");
    await next.setRemoteDescription(
      new RTCSessionDescription({ type: "offer", sdp }),
    );
    ledger.bindTo(next);

    const answer = await next.createAnswer();
    await next.setLocalDescription(answer);
    await updateDoc(room, {
      answer: { type: "answer", sdp: answer.sdp ?? "" },
    });
    nextOutbox.flush();
  };

  const unsubscribeRoom = onSnapshot(room, (snapshot) => {
    const data = snapshot.data() as MicLinkRoom | undefined;
    if (isClosed || !data?.offer) return;
    // Every negotiation produces a fresh SDP, so an unchanged one means this is
    // an echo of a write we already handled (our own answer, for instance).
    if (data.offer.sdp === handledOfferSdp) return;
    handledOfferSdp = data.offer.sdp;

    answerOffer(data.offer.sdp).catch((error: Error) => {
      handlers.onError(error.message);
      handlers.onStatus("error");
    });
  });

  const unsubscribeCandidates = onSnapshot(
    senderCandidatesRef(roomId),
    (snapshot) => {
      if (isClosed) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
          ledger.forget(change.doc.id);
          return;
        }
        ledger.add(change.doc.id, change.doc.data() as MicLinkCandidate);
      });
    },
  );

  return {
    getConnectionInfo: async () => {
      if (isClosed || !peer || peer.connectionState !== "connected")
        return null;
      const result = await readConnectionInfo(peer, cursor);
      if (!result) return null;
      cursor = result.cursor;
      return result.info;
    },
    close: async () => {
      if (isClosed) return;
      isClosed = true;
      unsubscribeRoom();
      unsubscribeCandidates();
      peer?.close();
      peer = null;
      handlers.onStatus("closed");
      // The room belongs to the receiver: it created it, and deleting it is
      // what kills the QR code so a stale link cannot be reused. Skip the
      // delete if a newer receiver has taken the room over in the meantime.
      const current = await getDoc(room).catch(() => null);
      if (current?.exists() && current.data().ownerToken !== ownerToken) return;

      await Promise.all([
        clearCollection(senderCandidatesRef(roomId)),
        clearCollection(receiverCandidatesRef(roomId)),
      ]).catch(() => undefined);
      await deleteDoc(room).catch(() => undefined);
    },
  };
};

// The phone. Publishes the offer that carries its microphone track.
export const openSenderSession = async (
  roomId: string,
  stream: MediaStream,
  quality: MicLinkQuality,
  label: string,
  handlers: MicLinkHandlers,
): Promise<MicLinkSession> => {
  const room = roomRef(roomId);
  const existing = await getDoc(room);
  if (!existing.exists()) throw new Error("ROOM_NOT_FOUND");

  const peer = buildPeerConnection();
  const ledger = createCandidateLedger();
  const outbox = createCandidateOutbox(senderCandidatesRef(roomId));

  let isClosed = false;
  let hasRemoteAnswer = false;
  let cursor: StatsCursor | null = null;

  stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));

  peer.onicecandidate = (event) => {
    if (event.candidate && !isClosed) outbox.handle(event.candidate);
  };
  peer.onconnectionstatechange = () => {
    if (!isClosed) {
      handlers.onStatus(statusFromConnectionState(peer.connectionState));
    }
  };

  const unsubscribeRoom = onSnapshot(room, (snapshot) => {
    const data = snapshot.data() as MicLinkRoom | undefined;
    if (isClosed || !data?.answer || hasRemoteAnswer) return;
    hasRemoteAnswer = true;

    peer
      .setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: data.answer.sdp }),
      )
      .then(() => ledger.bindTo(peer))
      .catch((error: Error) => {
        handlers.onError(error.message);
        handlers.onStatus("error");
      });
  });

  const unsubscribeCandidates = onSnapshot(
    receiverCandidatesRef(roomId),
    (snapshot) => {
      if (isClosed) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
          ledger.forget(change.doc.id);
          return;
        }
        ledger.add(change.doc.id, change.doc.data() as MicLinkCandidate);
      });
    },
  );

  handlers.onStatus("connecting");

  // Clear anything left from an earlier attempt in this room *before* the fresh
  // offer lands, so the receiver never mixes candidates from two negotiations.
  await Promise.all([
    clearCollection(senderCandidatesRef(roomId)),
    clearCollection(receiverCandidatesRef(roomId)),
  ]);
  await updateDoc(room, { answer: deleteField() });

  const offer = await peer.createOffer();
  const sdp = preferHighQualityOpus(offer.sdp ?? "", quality);
  await peer.setLocalDescription(
    new RTCSessionDescription({ type: "offer", sdp }),
  );
  await applyBitrateCap(peer, quality);
  await updateDoc(room, {
    offer: { type: "offer", sdp },
    quality,
    senderLabel: label,
  });
  outbox.flush();

  return {
    getConnectionInfo: async () => {
      if (isClosed || peer.connectionState !== "connected") return null;
      const result = await readConnectionInfo(peer, cursor);
      if (!result) return null;
      cursor = result.cursor;
      return result.info;
    },
    close: async () => {
      if (isClosed) return;
      isClosed = true;
      unsubscribeRoom();
      unsubscribeCandidates();
      peer.close();
      handlers.onStatus("closed");
      await updateDoc(room, { endedAt: Date.now() }).catch(() => undefined);
    },
  };
};
