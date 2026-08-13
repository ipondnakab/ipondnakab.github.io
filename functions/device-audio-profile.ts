export type DevicePlatform = "ios" | "android" | "desktop";

export interface DeviceAudioProfile {
  platform: DevicePlatform;
  // What the OS charges to hand us a microphone buffer, if it will say.
  captureLatencyMs?: number;
  // What the OS charges to get a sample back out of the speaker.
  outputLatencyMs?: number;
}

// Which platform this is matters more than any tuning we can do: Chrome on
// Android routinely carries 100-300ms in its audio stack where iOS sits around
// 20-40ms. That single fact decides whether a latency complaint is worth
// chasing in our code at all, so it is measured and shown rather than guessed.
export const describePlatform = (): DevicePlatform => {
  if (typeof navigator === "undefined") return "desktop";
  const agent = navigator.userAgent;
  if (/android/i.test(agent)) return "android";
  // iPadOS reports as a Mac, so the touch-point check is what separates a real
  // desktop Safari from an iPad pretending to be one.
  if (
    /iPad|iPhone|iPod/.test(agent) ||
    (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  return "desktop";
};

// `latency` is an optional MediaTrackSetting, reported in seconds. Chrome fills
// it in; Safari and Firefox generally do not.
export const readCaptureLatencyMs = (
  stream: MediaStream,
): number | undefined => {
  const track = stream.getAudioTracks()[0];
  if (!track) return undefined;
  const settings = track.getSettings() as { latency?: number };
  return settings.latency === undefined
    ? undefined
    : Math.round(settings.latency * 1000);
};
