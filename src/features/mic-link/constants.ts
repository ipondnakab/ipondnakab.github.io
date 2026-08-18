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

// How many phones may join one room. Each one costs a peer connection and an
// Opus decode, and the mixer strips stop being readable well before the CPU
// becomes the problem — so this is a UI limit as much as a resource one.
export const MIC_LINK_MAX_SENDERS = 6;

// Linear gain bounds for a mixer channel. 1 is unity; the headroom above it is
// there to lift a phone that is further from the speaker than the others.
export const MIC_LINK_MIN_GAIN = 0;
export const MIC_LINK_MAX_GAIN = 2;
export const MIC_LINK_DEFAULT_GAIN = 1;

// Opus packetises at 20ms by default. Halving it costs a little bandwidth
// overhead and buys back ~10ms of the round trip, which matters when someone is
// listening to their own voice.
export const MIC_LINK_LOW_LATENCY_PTIME_MS = 10;

// Volume for the phone monitoring its own microphone locally. Deliberately
// below unity: this only ever goes to headphones, and starting loud with a mic
// live next to them is a bad idea.
export const MIC_LINK_LOCAL_MONITOR_DEFAULT_VOLUME = 0.6;
