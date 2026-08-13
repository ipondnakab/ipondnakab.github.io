// Mic Link turns a phone into a wireless microphone for another device on the
// same network. Audio travels peer-to-peer over WebRTC; Firestore is used only
// as a signalling mailbox (offer / answer / ICE candidates) because the site is
// a static export with no server to run a WebSocket on.
//
// The phone (sender) is always the WebRTC *offerer*: its offer SDP already
// carries the real audio m-line, so the desktop (receiver) only has to answer.

export type MicLinkStatus =
  | "idle" // nothing started yet
  | "waiting" // room is open, the other device has not joined
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

// The room document at `mic-link/{roomId}`.
export interface MicLinkRoom {
  createdAt: number;
  quality: MicLinkQuality;
  // Identifies the receiver that currently owns this room, so a session that is
  // being torn down never deletes a room a newer session has already recreated
  // under the same id (which is exactly what React StrictMode's double-mount
  // does in development).
  ownerToken: string;
  offer?: MicLinkSessionDescription;
  answer?: MicLinkSessionDescription;
  senderLabel?: string; // what the phone calls its chosen microphone
  endedAt?: number;
}

// Live connection telemetry, read from `RTCPeerConnection.getStats()`.
export interface MicLinkConnectionInfo {
  localCandidateType?: string;
  remoteCandidateType?: string;
  roundTripTimeMs?: number;
  bitrateKbps?: number;
  // True when both ends picked "host" candidates, i.e. the audio is going
  // straight across the LAN and never leaves the network.
  isDirect: boolean;
}
