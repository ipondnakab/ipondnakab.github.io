import { db } from "@/shared/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import type { ScoreRoom } from "./realtime-room";

type RoomMessage = { type: "score"; room: ScoreRoom };
type Status = "connecting" | "direct" | "firebase";
type PeerSession = (() => void) & { broadcast: (room: ScoreRoom) => void };

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const waitForIce = (peer: RTCPeerConnection) =>
  new Promise<void>((resolve) => {
    if (peer.iceGatheringState === "complete") return resolve();
    const finish = () => {
      peer.removeEventListener("icegatheringstatechange", check);
      clearTimeout(timeout);
      resolve();
    };
    const check = () => {
      if (peer.iceGatheringState === "complete") finish();
    };
    const timeout = setTimeout(finish, 5000);
    peer.addEventListener("icegatheringstatechange", check);
  });

/**
 * Firestore is authoritative. WebRTC carries only committed score snapshots.
 * Losing a peer connection never blocks scoring or Firestore synchronization.
 */
export const connectScorePeers = (
  roomCode: string,
  onScore: (room: ScoreRoom) => void,
  onStatus: (status: Status) => void,
) : PeerSession => {
  if (typeof RTCPeerConnection === "undefined") {
    onStatus("firebase");
    return Object.assign(() => {}, { broadcast: (_room: ScoreRoom) => {} });
  }

  const self = crypto.randomUUID();
  const participants = collection(db, "badmintonScoreRooms", roomCode, "peers");
  const links = collection(db, "badmintonScoreRooms", roomCode, "links");
  const presence = doc(participants, self);
  const connections = new Map<
    string,
    { peer: RTCPeerConnection; channel?: RTCDataChannel; stop: () => void }
  >();
  let disposed = false;
  let latest: ScoreRoom | null = null;
  let stopPresence = () => {};

  const refreshStatus = () => {
    if (disposed) return;
    const direct = [...connections.values()].some(
      ({ channel }) => channel?.readyState === "open",
    );
    onStatus(direct ? "direct" : "firebase");
  };

  const closePeer = (id: string) => {
    const connection = connections.get(id);
    if (!connection) return;
    connections.delete(id);
    connection.stop();
    connection.channel?.close();
    connection.peer.close();
    refreshStatus();
  };

  const attachChannel = (id: string, channel: RTCDataChannel) => {
    const connection = connections.get(id);
    if (!connection) return;
    connection.channel = channel;
    channel.onopen = () => {
      refreshStatus();
      if (latest) channel.send(JSON.stringify({ type: "score", room: latest }));
    };
    channel.onclose = refreshStatus;
    channel.onmessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as RoomMessage;
        if (message.type === "score" && message.room) onScore(message.room);
      } catch {
        // Ignore invalid or outdated peer messages; Firestore remains authoritative.
      }
    };
  };

  const connect = (other: string) => {
    if (connections.has(other) || disposed) return;
    const initiator = self < other;
    const key = [self, other].sort().join("_");
    const signal = doc(links, key);
    const peer = new RTCPeerConnection(rtcConfig);
    connections.set(other, { peer, stop: () => {} });
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed" || peer.connectionState === "closed") {
        closePeer(other);
      } else {
        refreshStatus();
      }
    };
    peer.ondatachannel = (event) => attachChannel(other, event.channel);
    if (initiator) {
      attachChannel(other, peer.createDataChannel("scores", { ordered: true }));
    }
    let busy = false;
    const stop = onSnapshot(signal, async (snapshot) => {
      if (!snapshot.exists() || disposed || busy) return;
      const data = snapshot.data();
      try {
        busy = true;
        if (!initiator && data.offer && !peer.currentRemoteDescription) {
          await peer.setRemoteDescription(
            new RTCSessionDescription(data.offer as RTCSessionDescriptionInit),
          );
          await peer.setLocalDescription(await peer.createAnswer());
          await waitForIce(peer);
          await setDoc(
            signal,
            { answer: peer.localDescription?.toJSON() },
            { merge: true },
          );
        } else if (
          initiator &&
          data.answer &&
          !peer.currentRemoteDescription
        ) {
          await peer.setRemoteDescription(
            new RTCSessionDescription(data.answer as RTCSessionDescriptionInit),
          );
        }
      } catch {
        closePeer(other);
      } finally {
        busy = false;
      }
    }, () => closePeer(other));
    connections.get(other)!.stop = stop;

    if (initiator) {
      void (async () => {
        try {
          await peer.setLocalDescription(await peer.createOffer());
          await waitForIce(peer);
          if (!disposed) {
            await setDoc(signal, {
              offer: peer.localDescription?.toJSON(),
            });
          }
        } catch {
          closePeer(other);
        }
      })();
    }
  };

  const stopParticipants = onSnapshot(
    participants,
    (snapshot) => {
      const now = Date.now();
      const active = new Set<string>();
      snapshot.forEach((entry) => {
        if (entry.id === self) return;
        const seen = entry.data().seenAt;
        if (typeof seen !== "number" || now - seen > 60000) return;
        active.add(entry.id);
        connect(entry.id);
      });
      for (const id of connections.keys()) {
        if (!active.has(id)) closePeer(id);
      }
    },
    () => onStatus("firebase"),
  );

  const announce = () => {
    if (!disposed) {
      void setDoc(presence, { seenAt: Date.now() }).catch(() => {
        onStatus("firebase");
      });
    }
  };
  announce();
  const heartbeat = setInterval(announce, 20000);
  stopPresence = () => {
    clearInterval(heartbeat);
    void deleteDoc(presence).catch(() => {});
  };

  return Object.assign(
    () => {
      disposed = true;
      stopParticipants();
      stopPresence();
      for (const id of [...connections.keys()]) closePeer(id);
    },
    {
      broadcast: (room: ScoreRoom) => {
        latest = room;
        const message = JSON.stringify({ type: "score", room });
        for (const { channel } of connections.values()) {
          if (channel?.readyState === "open") channel.send(message);
        }
      },
    },
  );
};
