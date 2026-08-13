// Mic Link turns one or more phones into wireless microphones for another
// device on the same network. Audio travels peer-to-peer over WebRTC; Firestore
// is used only as a signalling mailbox (offer / answer / ICE candidates)
// because the site is a static export with no server to run a WebSocket on.
//
// Each phone (sender) is always the WebRTC *offerer*: its offer SDP already
// carries the real audio m-line, so the receiver only has to answer. The
// receiver holds one peer connection per phone and sums them in a Web Audio
// mixer, which is what makes gain / mute / solo and a single mixed recording
// possible.

export type MicLinkStatus =
  | "idle" // nothing started yet
  | "waiting" // room is open, no phone has joined
  | "connecting" // ICE is negotiating
  | "live" // audio is flowing
  | "closed" // session ended cleanly
  | "error";

// "voice" keeps the browser's call-oriented processing (echo cancellation,
// noise suppression, auto gain) — best for meetings and voice notes.
// "hifi" turns all of it off and asks for stereo 48kHz — best for instruments,
// singing or room recording, at the cost of picking up more background noise.
export type MicLinkQuality = "voice" | "hifi";

export interface MicLinkSessionDescription {
  type: "offer" | "answer";
  sdp: string;
}

// Firestore rejects `undefined`, so every optional field of an ICE candidate is
// normalised to `null` before it is written.
export interface MicLinkCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment: string | null;
}

// The room document at `mic-link/{roomId}`. Deliberately tiny — everything
// per-phone lives one level down, so phones never write to a shared document
// and cannot clobber each other's negotiation.
export interface MicLinkRoom {
  createdAt: number;
  // Identifies the receiver that currently owns this room, so a session that is
  // being torn down never deletes a room a newer session has already recreated
  // under the same id (which is exactly what React StrictMode's double-mount
  // does in development).
  ownerToken: string;
  endedAt?: number;
}

// One connected phone, at `mic-link/{roomId}/senders/{senderId}`.
export interface MicLinkSenderDoc {
  label: string; // what the phone calls its chosen microphone
  quality: MicLinkQuality;
  joinedAt: number;
  offer?: MicLinkSessionDescription;
  answer?: MicLinkSessionDescription;
  // The phone's own audio stack cost, published so the receiver can show why a
  // session feels slow without anyone having to walk over and read the phone.
  platform?: string;
  captureLatencyMs?: number;
  deviceOutputLatencyMs?: number;
}

// Receiver-side view of one connected phone.
export interface MicLinkInput {
  senderId: string;
  label: string;
  quality: MicLinkQuality;
  status: MicLinkStatus;
  stream: MediaStream | null;
  platform?: string;
  captureLatencyMs?: number;
  deviceOutputLatencyMs?: number;
}

// Mixer settings for one input. `gain` is a linear multiplier, so 1 is unity.
export interface MicLinkChannelState {
  gain: number;
  isMuted: boolean;
  isSoloed: boolean;
}

// Live connection telemetry, read from `RTCPeerConnection.getStats()`.
export interface MicLinkConnectionInfo {
  localCandidateType?: string;
  remoteCandidateType?: string;
  roundTripTimeMs?: number;
  bitrateKbps?: number;
  // Average time a sample currently spends in the receive jitter buffer. This
  // is normally the single largest contributor to the delay a singer hears,
  // which is why it is surfaced separately rather than folded into a total.
  jitterBufferMs?: number;
  // What the browser is aiming for, as opposed to what it achieved. Low-latency
  // mode asks for 0; if this stays high anyway, the browser is ignoring the
  // request and the remaining delay is not reachable from here.
  jitterBufferTargetMs?: number;
  // True when both ends picked "host" candidates, i.e. the audio is going
  // straight across the LAN and never leaves the network.
  isDirect: boolean;
}

// An estimate of the delay between someone speaking and the sound leaving this
// device's output. Only the measurable parts are included — the phone's own
// capture buffer is not exposed by any browser API, so a real mouth-to-ear
// figure is roughly this plus 10-20ms.
export interface MicLinkLatencyEstimate {
  jitterBufferMs: number;
  networkMs: number; // one way, i.e. half the reported round trip
  outputMs: number; // Web Audio render quantum + OS output buffer
  totalMs: number;
}
