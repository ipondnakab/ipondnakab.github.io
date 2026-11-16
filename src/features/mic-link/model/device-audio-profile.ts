export type DevicePlatform = "ios" | "android" | "desktop";

export interface DeviceAudioProfile {
  platform: DevicePlatform;
  // What the OS charges to hand us a microphone buffer, if it will say.
  captureLatencyMs?: number;
  // What the OS charges to get a sample back out of the speaker.
  outputLatencyMs?: number;
}
