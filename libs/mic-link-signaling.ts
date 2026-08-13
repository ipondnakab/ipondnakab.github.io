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
  MIC_LINK_LOW_LATENCY_PTIME_MS,
  MIC_LINK_MAX_BITRATE_KBPS,
  MIC_LINK_MAX_SENDERS,
} from "@/constants/mic-link";
import {
  MicLinkCandidate,
  MicLinkConnectionInfo,
  MicLinkQuality,
  MicLinkSenderDoc,
  MicLinkStatus,
} from "@/interfaces/mic-link";
import { db } from "@/libs/firebase";

// WebRTC signalling over Firestore.
//
// Firestore is only a mailbox: the devices swap SDP offer/answer pairs and
// their ICE candidates through it, then the audio itself flows directly between
// them. On a shared LAN ICE settles on "host" candidates, so the media never
// leaves the network even though the page is served from the internet.
//
// Every phone owns its own document under `senders/`, with its own candidate
// subcollections, so several phones can negotiate with one receiver at the same
// time without ever writing to the same document. The receiver keeps one peer
// connection per phone and rebuilds an individual one whenever that phone
// publishes a *new* offer — which is what lets a phone reconnect after a screen
// lock without the user rescanning the QR code.

const roomRef = (roomId: string): DocumentReference =>
  doc(db, MIC_LINK_DB_NAME, roomId);

const sendersRef = (roomId: string): CollectionReference =>
  collection(db, MIC_LINK_DB_NAME, roomId, "senders");

const senderRef = (roomId: string, senderId: string): DocumentReference =>
  doc(db, MIC_LINK_DB_NAME, roomId, "senders", senderId);

const senderCandidatesRef = (
  roomId: string,
  senderId: string,
): CollectionReference =>
  collection(
    db,
    MIC_LINK_DB_NAME,
    roomId,
    "senders",
    senderId,
    "senderCandidates",
  );

const receiverCandidatesRef = (
  roomId: string,
  senderId: string,
): CollectionReference =>
  collection(
    db,
    MIC_LINK_DB_NAME,
    roomId,
    "senders",
    senderId,
    "receiverCandidates",
  );

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

// A Firestore listener that is rejected simply stops delivering, with no
// exception anywhere the caller can see it. Without this every rules problem
// looks identical to "the other device never joined", which is a miserable
// thing to debug — so listener failures are reported by their error code.
const onSnapshotError =
  (report: (message: string) => void, scope: string) =>
  (error: Error): void => {
    const code = (error as { code?: string }).code ?? error.message;
    console.warn(`[mic-link] the ${scope} listener failed`, error);
    report(code);
  };

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
// separate from the peer connection is also what makes a rebuild safe, since
// the replay happens again against the new connection.
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

// Rewrites the packet duration for the Opus media section. Chrome picks its
// *send* packet size from what the far end advertises, which is why the
// receiver has to munge its answer too — munging only the offer changes
// nothing about what the phone actually transmits.
const withPacketDuration = (sdp: string, ms: number): string => {
  if (/a=ptime:\d+/.test(sdp)) {
    return sdp.replace(/a=ptime:\d+/g, `a=ptime:${ms}`);
  }
  return sdp.replace(
    /(a=rtpmap:\d+ opus\/48000\/2[^\r\n]*\r?\n)/,
    `$1a=ptime:${ms}\r\n`,
  );
};

export interface MicLinkOpusPreferences {
  quality: MicLinkQuality;
  lowLatency: boolean;
}

// Opus defaults to mono, voice-grade, 20ms packets. None of stereo, bitrate or
// packet duration is reachable through an API, so the fmtp line is rewritten by
// hand. Applied by both sides: each one describes what it wants to receive.
export const applyOpusPreferences = (
  sdp: string,
  preferences: MicLinkOpusPreferences,
): string => {
  const rtpmap = sdp.match(/a=rtpmap:(\d+) opus\/48000\/2/);
  if (!rtpmap) return sdp;

  const payloadType = rtpmap[1];
  const params: string[] = [];

  if (preferences.quality === "hifi") {
    params.push(
      "stereo=1",
      "sprop-stereo=1",
      "maxaveragebitrate=256000",
      "useinbandfec=1",
    );
  }
  if (preferences.lowLatency) {
    // usedtx=0 because discontinuous transmission saves bandwidth during
    // silence at the cost of a ramp-up on every new phrase — audible, and
    // exactly wrong for singing.
    params.push(`minptime=${MIC_LINK_LOW_LATENCY_PTIME_MS}`, "usedtx=0");
  }
  if (params.length === 0) return sdp;

  const extras = params.join(";");
  const fmtpPattern = new RegExp(`a=fmtp:${payloadType} ([^\\r\\n]*)`);
  const withFmtp = fmtpPattern.test(sdp)
    ? sdp.replace(
        fmtpPattern,
        (_match, existing: string) =>
          `a=fmtp:${payloadType} ${existing};${extras}`,
      )
    : sdp.replace(
        `a=rtpmap:${payloadType} opus/48000/2`,
        `a=rtpmap:${payloadType} opus/48000/2\r\na=fmtp:${payloadType} ${extras}`,
      );

  return preferences.lowLatency
    ? withPacketDuration(withFmtp, MIC_LINK_LOW_LATENCY_PTIME_MS)
    : withFmtp;
};

// Neither knob is in lib.dom consistently: `jitterBufferTarget` is the
// standardised one (WebRTC Extensions), `playoutDelayHint` the older
// Chrome-only spelling. Both are set so this works across versions.
interface TunableReceiver {
  jitterBufferTarget?: number | null;
  playoutDelayHint?: number | null;
}

// The receive jitter buffer is sized for the public internet, where it absorbs
// reordering and jitter. On a LAN there is almost nothing to absorb, but it
// still holds 40-100ms+ — normally the largest single component of the delay a
// singer hears through the speakers. Pinning it to zero trades that delay for
// sensitivity to real network trouble, which is why it is opt-in.
const applyPlayoutDelay = (
  peer: RTCPeerConnection,
  lowLatency: boolean,
): void => {
  peer.getReceivers().forEach((receiver) => {
    if (receiver.track?.kind !== "audio") return;
    const tunable = receiver as unknown as TunableReceiver;
    try {
      if ("jitterBufferTarget" in tunable) {
        tunable.jitterBufferTarget = lowLatency ? 0 : null;
      }
      if ("playoutDelayHint" in tunable) {
        tunable.playoutDelayHint = lowLatency ? 0 : null;
      }
    } catch (error) {
      console.warn("[mic-link] could not tune the jitter buffer", error);
    }
  });
};

interface MicLinkRawStat {
  id: string;
  type: string;
  kind?: string;
  state?: string;
  localCandidateId?: string;
  remoteCandidateId?: string;
  currentRoundTripTime?: number;
  bytesReceived?: number;
  candidateType?: string;
  // Both are cumulative totals: the average delay right now is the ratio of
  // their deltas between two samples, not the lifetime ratio.
  jitterBufferDelay?: number;
  jitterBufferEmittedCount?: number;
}

interface StatsCursor {
  bytes: number;
  at: number;
  jitterDelay: number;
  jitterCount: number;
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
  const inbound = stats.find(
    (stat) => stat.type === "inbound-rtp" && stat.kind === "audio",
  );

  const cursor: StatsCursor = {
    bytes: pair.bytesReceived ?? 0,
    at: Date.now(),
    jitterDelay: inbound?.jitterBufferDelay ?? 0,
    jitterCount: inbound?.jitterBufferEmittedCount ?? 0,
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

  // Delta rather than lifetime average, so the number reacts when the jitter
  // buffer is retuned instead of being dragged down by every sample since the
  // connection opened.
  const emitted = previous ? cursor.jitterCount - previous.jitterCount : 0;
  const jitterBufferMs =
    previous && emitted > 0
      ? Math.round(
          ((cursor.jitterDelay - previous.jitterDelay) / emitted) * 1000,
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
      jitterBufferMs,
      isDirect:
        local?.candidateType === "host" && remote?.candidateType === "host",
    },
  };
};

export interface MicLinkReceiverHandlers {
  // Room-level state: waiting for phones, closed, or failed to open.
  onStatus: (status: MicLinkStatus) => void;
  onError: (message: string) => void;
  onSenderJoined: (senderId: string, sender: MicLinkSenderDoc) => void;
  onSenderStatus: (senderId: string, status: MicLinkStatus) => void;
  onSenderStream: (senderId: string, stream: MediaStream) => void;
  onSenderLeft: (senderId: string) => void;
}

export interface MicLinkReceiverSession {
  // Telemetry for one phone, or for the busiest connection when omitted.
  getConnectionInfo: (
    senderId?: string,
  ) => Promise<MicLinkConnectionInfo | null>;
  // Applies to every live connection immediately. The packet-duration half of
  // low-latency mode only takes effect on the next negotiation, since it is
  // carried in the SDP.
  setLowLatency: (enabled: boolean) => void;
  close: () => Promise<void>;
}

// One receiver-side slot: everything needed to talk to a single phone.
interface ReceiverSlot {
  peer: RTCPeerConnection | null;
  ledger: CandidateLedger;
  handledOfferSdp: string | null;
  cursor: StatsCursor | null;
  unsubscribeCandidates: () => void;
  dispose: () => void;
}

// The receiving device. Creates the room, then answers every phone that joins.
export const openReceiverSession = async (
  roomId: string,
  handlers: MicLinkReceiverHandlers,
  initialLowLatency = false,
): Promise<MicLinkReceiverSession> => {
  const room = roomRef(roomId);
  const slots = new Map<string, ReceiverSlot>();

  let isClosed = false;
  let lowLatency = initialLowLatency;

  const ownerToken =
    crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  await setDoc(room, { createdAt: Date.now(), ownerToken });
  handlers.onStatus("waiting");

  const answerOffer = async (
    senderId: string,
    slot: ReceiverSlot,
    sdp: string,
    quality: MicLinkQuality,
  ): Promise<void> => {
    slot.peer?.close();
    const next = buildPeerConnection();
    const outbox = createCandidateOutbox(
      receiverCandidatesRef(roomId, senderId),
    );
    slot.peer = next;
    slot.cursor = null;

    next.onicecandidate = (event) => {
      if (event.candidate && !isClosed) outbox.handle(event.candidate);
    };
    next.ontrack = (event) => {
      handlers.onSenderStream(
        senderId,
        event.streams[0] ?? new MediaStream([event.track]),
      );
    };
    next.onconnectionstatechange = () => {
      // Ignore a superseded connection still winding down after a rebuild.
      if (isClosed || slot.peer !== next) return;
      handlers.onSenderStatus(
        senderId,
        statusFromConnectionState(next.connectionState),
      );
    };

    handlers.onSenderStatus(senderId, "connecting");
    await next.setRemoteDescription(
      new RTCSessionDescription({ type: "offer", sdp }),
    );
    slot.ledger.bindTo(next);
    // Receivers only exist once the remote description has been applied.
    applyPlayoutDelay(next, lowLatency);

    const answer = await next.createAnswer();
    // The answer advertises what we want to *receive*, which is what tells the
    // phone to send 10ms packets instead of 20ms ones.
    const answerSdp = applyOpusPreferences(answer.sdp ?? "", {
      quality,
      lowLatency,
    });
    await next.setLocalDescription(
      new RTCSessionDescription({ type: "answer", sdp: answerSdp }),
    );
    await updateDoc(senderRef(roomId, senderId), {
      answer: { type: "answer", sdp: answerSdp },
    });
    outbox.flush();
  };

  const createSlot = (senderId: string): ReceiverSlot => {
    const ledger = createCandidateLedger();
    const unsubscribeCandidates = onSnapshot(
      senderCandidatesRef(roomId, senderId),
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
      onSnapshotError(handlers.onError, "sender candidates"),
    );

    const slot: ReceiverSlot = {
      peer: null,
      ledger,
      handledOfferSdp: null,
      cursor: null,
      unsubscribeCandidates,
      dispose: () => {
        unsubscribeCandidates();
        slot.peer?.close();
        slot.peer = null;
      },
    };
    return slot;
  };

  const unsubscribeSenders = onSnapshot(
    sendersRef(roomId),
    (snapshot) => {
      if (isClosed) return;

      snapshot.docChanges().forEach((change) => {
        const senderId = change.doc.id;

        if (change.type === "removed") {
          slots.get(senderId)?.dispose();
          slots.delete(senderId);
          handlers.onSenderLeft(senderId);
          return;
        }

        const data = change.doc.data() as MicLinkSenderDoc;
        let slot = slots.get(senderId);

        if (!slot) {
          // Refuse phone number N+1 rather than degrading the whole room.
          if (slots.size >= MIC_LINK_MAX_SENDERS) return;
          slot = createSlot(senderId);
          slots.set(senderId, slot);
        }
        // Fired for updates too, not just the first sighting: a phone writes its
        // label and quality before its offer, and rewrites them whenever the user
        // switches microphone. The consumer upserts.
        handlers.onSenderJoined(senderId, data);

        if (!data.offer) return;
        // Every negotiation produces a fresh SDP, so an unchanged one means this
        // is an echo of a write we already handled (our own answer, for example).
        if (data.offer.sdp === slot.handledOfferSdp) return;
        slot.handledOfferSdp = data.offer.sdp;

        answerOffer(senderId, slot, data.offer.sdp, data.quality).catch(
          (error: Error) => {
            handlers.onError(error.message);
            handlers.onSenderStatus(senderId, "error");
          },
        );
      });
    },
    onSnapshotError(handlers.onError, "senders"),
  );

  return {
    getConnectionInfo: async (senderId) => {
      if (isClosed) return null;
      const candidates = senderId
        ? [slots.get(senderId)].filter(Boolean)
        : Array.from(slots.values());

      for (const slot of candidates as ReceiverSlot[]) {
        if (!slot.peer || slot.peer.connectionState !== "connected") continue;
        const result = await readConnectionInfo(slot.peer, slot.cursor);
        if (!result) continue;
        slot.cursor = result.cursor;
        return result.info;
      }
      return null;
    },
    setLowLatency: (enabled) => {
      lowLatency = enabled;
      // Takes effect on every live connection right away. The SDP half (packet
      // duration) waits for the next negotiation, which is fine — the jitter
      // buffer is by far the larger of the two.
      slots.forEach((slot) => {
        if (slot.peer) applyPlayoutDelay(slot.peer, enabled);
      });
    },
    close: async () => {
      if (isClosed) return;
      isClosed = true;
      unsubscribeSenders();
      slots.forEach((slot) => slot.dispose());
      slots.clear();
      handlers.onStatus("closed");

      // The room belongs to the receiver: it created it, and deleting it is
      // what kills the QR code so a stale link cannot be reused. Skip the
      // delete if a newer receiver has taken the room over in the meantime.
      const current = await getDoc(room).catch(() => null);
      if (current?.exists() && current.data().ownerToken !== ownerToken) return;

      const senders = await getDocs(sendersRef(roomId)).catch(() => null);
      if (senders) {
        await Promise.all(
          senders.docs.map(async (entry) => {
            await Promise.all([
              clearCollection(senderCandidatesRef(roomId, entry.id)),
              clearCollection(receiverCandidatesRef(roomId, entry.id)),
            ]).catch(() => undefined);
            await deleteDoc(entry.ref).catch(() => undefined);
          }),
        );
      }
      await deleteDoc(room).catch(() => undefined);
    },
  };
};

export interface MicLinkSenderHandlers {
  onStatus: (status: MicLinkStatus) => void;
  onError: (message: string) => void;
}

export interface MicLinkSenderCloseOptions {
  // Leave this phone's registration document in place. Used when closing only
  // to immediately renegotiate: the receiver then sees a new offer on an
  // existing sender rather than a removal followed by a fresh join, so the
  // mixer strip — and everything the user has set on it — survives.
  keepRegistration?: boolean;
}

export interface MicLinkSenderSession {
  getConnectionInfo: () => Promise<MicLinkConnectionInfo | null>;
  close: (options?: MicLinkSenderCloseOptions) => Promise<void>;
}

// One phone. Publishes the offer that carries its microphone track into its own
// document, so it never contends with the other phones in the room.
export const openSenderSession = async (
  roomId: string,
  senderId: string,
  stream: MediaStream,
  quality: MicLinkQuality,
  label: string,
  handlers: MicLinkSenderHandlers,
): Promise<MicLinkSenderSession> => {
  const room = roomRef(roomId);
  const existing = await getDoc(room);
  if (!existing.exists()) throw new Error("ROOM_NOT_FOUND");

  const self = senderRef(roomId, senderId);
  // Best-effort capacity check. The receiver enforces the real limit; this only
  // exists so the phone can say "room is full" instead of silently never
  // connecting.
  const peers = await getDocs(sendersRef(roomId)).catch(() => null);
  if (
    peers &&
    peers.docs.filter((entry) => entry.id !== senderId).length >=
      MIC_LINK_MAX_SENDERS
  ) {
    throw new Error("ROOM_FULL");
  }

  const peer = buildPeerConnection();
  const ledger = createCandidateLedger();
  const outbox = createCandidateOutbox(senderCandidatesRef(roomId, senderId));

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

  const unsubscribeSelf = onSnapshot(
    self,
    (snapshot) => {
      const data = snapshot.data() as MicLinkSenderDoc | undefined;
      if (isClosed || !data?.answer || hasRemoteAnswer) return;
      // Only an answer that arrives while we are actually waiting for one can be
      // ours. This listener is attached before the offer is published, so its
      // first callback can carry an answer left over from a previous negotiation
      // on this same document — applying that would throw (the peer is still
      // "stable", with no local offer) *and* latch the flag, permanently
      // discarding the real answer that follows a moment later.
      if (peer.signalingState !== "have-local-offer") return;
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
    },
    onSnapshotError(handlers.onError, "own sender document"),
  );

  const unsubscribeCandidates = onSnapshot(
    receiverCandidatesRef(roomId, senderId),
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
    onSnapshotError(handlers.onError, "receiver candidates"),
  );

  handlers.onStatus("connecting");

  // Clear anything left from an earlier attempt by this same phone *before* the
  // fresh offer lands, so the receiver never mixes candidates from two
  // negotiations. Only this phone's own documents are touched.
  await Promise.all([
    clearCollection(senderCandidatesRef(roomId, senderId)),
    clearCollection(receiverCandidatesRef(roomId, senderId)),
  ]);
  await setDoc(
    self,
    { label, quality, joinedAt: Date.now(), answer: deleteField() },
    { merge: true },
  );

  const offer = await peer.createOffer();
  // No lowLatency here on purpose: these attributes describe what this peer
  // wants to *receive*, and the phone receives nothing. Packet duration is the
  // receiver's call, made in its answer.
  const sdp = applyOpusPreferences(offer.sdp ?? "", {
    quality,
    lowLatency: false,
  });
  await peer.setLocalDescription(
    new RTCSessionDescription({ type: "offer", sdp }),
  );
  await applyBitrateCap(peer, quality);
  await updateDoc(self, { offer: { type: "offer", sdp } });
  outbox.flush();

  return {
    getConnectionInfo: async () => {
      if (isClosed || peer.connectionState !== "connected") return null;
      const result = await readConnectionInfo(peer, cursor);
      if (!result) return null;
      cursor = result.cursor;
      return result.info;
    },
    close: async (options) => {
      if (isClosed) return;
      isClosed = true;
      unsubscribeSelf();
      unsubscribeCandidates();
      peer.close();
      handlers.onStatus("closed");
      // A renegotiation keeps the registration and lets the next offer land on
      // the same document; the candidate collections are cleared by the next
      // openSenderSession before it publishes anyway.
      if (options?.keepRegistration) return;

      // Removing our own document is what tells the receiver to drop this
      // phone's mixer strip.
      await Promise.all([
        clearCollection(senderCandidatesRef(roomId, senderId)),
        clearCollection(receiverCandidatesRef(roomId, senderId)),
      ]).catch(() => undefined);
      await deleteDoc(self).catch(() => undefined);
    },
  };
};
