export interface AudioLevelMonitor {
  // Round-trip cost of this device's own audio hardware and OS stack, in
  // milliseconds. Only meaningful once the context has actually rendered, so
  // read it a moment after starting rather than immediately.
  getOutputLatencyMs: () => number;
  stop: () => void;
}

// Drives a live input meter from a MediaStream. Reports a 0..1 level on every
// animation frame and tears the whole Web Audio graph down on stop — the
// AudioContext is a real OS audio resource, leaking one keeps the mic light on.
//
// Note for remote (WebRTC) streams: Chrome will not pump audio into Web Audio
// unless the same stream is also attached to a playing <audio> element, even a
// muted one. Callers on the receiving side must do that as well as calling this.
export const createAudioLevelMonitor = (
  stream: MediaStream,
  onLevel: (level: number) => void,
): AudioLevelMonitor => {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.6;
  source.connect(analyser);

  const samples = new Uint8Array(analyser.fftSize);
  let frame = 0;
  let stopped = false;

  // A suspended context produces silence; browsers start it that way unless the
  // call happened inside a user gesture.
  void context.resume().catch(() => undefined);

  const tick = (): void => {
    if (stopped) return;
    analyser.getByteTimeDomainData(samples);

    let sum = 0;
    for (let index = 0; index < samples.length; index += 1) {
      const value = (samples[index] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / samples.length);
    // Speech sits around 0.05-0.25 RMS, so raw values would barely move the
    // meter. This curve spreads that range across most of the bar.
    onLevel(Math.min(1, Math.pow(rms, 0.6) * 1.8));

    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return {
    getOutputLatencyMs: () => {
      // `outputLatency` is absent in Safari, where baseLatency alone is the
      // best available answer.
      const output = (context as { outputLatency?: number }).outputLatency ?? 0;
      return Math.round((context.baseLatency + output) * 1000);
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(frame);
      source.disconnect();
      analyser.disconnect();
      void context.close().catch(() => undefined);
      onLevel(0);
    },
  };
};
