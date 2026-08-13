import { MicLinkQuality } from "@/interfaces/mic-link";

export const MIC_LINK_ROOM_PARAM = "room";
// Presence of this query param is what makes a device the microphone (sender).
// The receiver encodes it into the QR code it displays.
export const MIC_LINK_MIC_PARAM = "mic";

// On the same LAN both peers exchange "host" candidates and connect directly,
// so STUN is only a fallback for the case where the two devices sit on
// different subnets (guest wifi vs wired, VPN, ...). No TURN is configured:
// relaying someone else's audio is not something a static site should pay for.
export const MIC_LINK_ICE_SERVERS: RTCIceServer[] = [
  {
    urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
  },
];

export const MIC_LINK_AUDIO_CONSTRAINTS: Record<
  MicLinkQuality,
  MediaTrackConstraints
> = {
  voice: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
  },
  hifi: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: 2,
    sampleRate: 48000,
  },
};

export const MIC_LINK_MAX_BITRATE_KBPS: Record<MicLinkQuality, number> = {
  voice: 48,
  hifi: 256,
};

// How often the receiver refreshes its connection telemetry.
export const MIC_LINK_STATS_INTERVAL_MS = 2000;
