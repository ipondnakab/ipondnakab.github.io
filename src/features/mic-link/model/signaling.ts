import {
  MicLinkCandidate,
  MicLinkConnectionInfo,
  MicLinkQuality,
  MicLinkSenderDoc,
  MicLinkStatus,
} from "@/features/mic-link/model/mic-link";

// Remembers every ICE candidate the other side has published, keyed by document
// id, and replays the lot into whichever peer connection is currently bound.
//
// Buffering is required in both directions: candidates routinely arrive before
// the description they belong to has been applied, and `addIceCandidate` throws
// if the peer connection has no remote description yet. Keeping the ledger
// separate from the peer connection is also what makes a rebuild safe, since
// the replay happens again against the new connection.
export interface CandidateLedger {
  add: (id: string, candidate: MicLinkCandidate) => void;
  forget: (id: string) => void;
  bindTo: (peer: RTCPeerConnection) => void;
}

// Holds this peer's own ICE candidates back until its description has been
// committed to Firestore. Writes from one client reach the other in commit
// order, so flushing only after the description write guarantees the remote
// side sees the description first.
export interface CandidateOutbox {
  handle: (candidate: RTCIceCandidate) => void;
  flush: () => void;
}

export interface MicLinkOpusPreferences {
  quality: MicLinkQuality;
  lowLatency: boolean;
}

// Neither knob is in lib.dom consistently: `jitterBufferTarget` is the
// standardised one (WebRTC Extensions), `playoutDelayHint` the older
// Chrome-only spelling. Both are set so this works across versions.
export interface TunableReceiver {
  jitterBufferTarget?: number | null;
  playoutDelayHint?: number | null;
}

export interface MicLinkRawStat {
  id: string;
  type: string;
  kind?: string;
  state?: string;
  localCandidateId?: string;
  remoteCandidateId?: string;
  currentRoundTripTime?: number;
  bytesReceived?: number;
  candidateType?: string;
  // All cumulative totals: the average right now is the ratio of their deltas
  // between two samples, not the lifetime ratio.
  jitterBufferDelay?: number;
  jitterBufferEmittedCount?: number;
  // What the browser is *aiming* for, as opposed to what it achieved. If this
  // stays high after low-latency mode is on, the jitterBufferTarget hint is
  // being ignored and no amount of further tuning here will help.
  jitterBufferTargetDelay?: number;
}

export interface StatsCursor {
  bytes: number;
  at: number;
  jitterDelay: number;
  jitterCount: number;
  jitterTargetDelay: number;
}

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
export interface ReceiverSlot {
  peer: RTCPeerConnection | null;
  ledger: CandidateLedger;
  handledOfferSdp: string | null;
  cursor: StatsCursor | null;
  unsubscribeCandidates: () => void;
  dispose: () => void;
}

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
  // Publishes this phone's measured audio-stack cost. Called after the context
  // has rendered for a moment, since `outputLatency` reads 0 before then.
  publishDeviceProfile: (profile: {
    platform: string;
    captureLatencyMs?: number;
    deviceOutputLatencyMs?: number;
  }) => Promise<void>;
  close: (options?: MicLinkSenderCloseOptions) => Promise<void>;
}
