export interface LocalAudioMonitor {
  setVolume: (volume: number) => void;
  stop: () => void;
}

// Loops the phone's own microphone straight back to its own output.
//
// This is the answer to "I hear myself late when I sing". The delay through the
// network path is dominated by the receiver's jitter buffer and cannot be cut
// below a few tens of milliseconds; this path never touches the network at all,
// so it costs only the phone's own capture and playback buffers.
//
// It is strictly a headphones feature. Through the phone's speaker the
// microphone hears its own output and the loop howls, and over Bluetooth the
// codec adds more delay than the network path it is replacing — wired only.
export const createLocalAudioMonitor = (
  stream: MediaStream,
  volume: number,
): LocalAudioMonitor => {
  const context = new AudioContext({ latencyHint: "interactive" });
  const source = context.createMediaStreamSource(stream);
  const gain = context.createGain();

  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(context.destination);

  // Started from a tap, so the context is normally already running; resuming is
  // only a safety net for browsers that hand back a suspended one anyway.
  void context.resume().catch(() => undefined);

  let stopped = false;

  return {
    setVolume: (next) => {
      if (stopped) return;
      // Ramped rather than assigned: stepping a gain on a live signal clicks.
      gain.gain.setTargetAtTime(next, context.currentTime, 0.015);
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      source.disconnect();
      gain.disconnect();
      void context.close().catch(() => undefined);
    },
  };
};
