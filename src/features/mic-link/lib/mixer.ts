import type {
  MicLinkMixer,
  MixerChannel,
} from "@/features/mic-link/model/mixer";

// Matches the curve used for the sender's own meter so both ends read alike.
const toDisplayLevel = (rms: number): number =>
  Math.min(1, Math.pow(rms, 0.6) * 1.8);

export const createMicLinkMixer = (): MicLinkMixer => {
  // "interactive" is the smallest buffer the browser will give us. It is also
  // the default, but stating it means a future change of default cannot quietly
  // add delay to someone monitoring their own voice.
  const context = new AudioContext({ latencyHint: "interactive" });
  const bus = context.createGain();
  const monitorGain = context.createGain();
  const recordDestination = context.createMediaStreamDestination();
  const channels = new Map<string, MixerChannel>();

  bus.gain.value = 1;
  // Monitoring starts silent: the phones' microphones will happily pick these
  // speakers back up, and the resulting feedback loop is unpleasant.
  monitorGain.gain.value = 0;

  bus.connect(recordDestination);
  bus.connect(monitorGain);
  monitorGain.connect(context.destination);

  return {
    recordingStream: recordDestination.stream,

    addInput: (id, stream) => {
      if (channels.has(id)) return;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      const gain = context.createGain();

      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      gain.gain.value = 1;

      source.connect(analyser);
      source.connect(gain);
      gain.connect(bus);

      channels.set(id, {
        source,
        analyser,
        gain,
        samples: new Uint8Array(analyser.fftSize),
      });
    },

    removeInput: (id) => {
      const channel = channels.get(id);
      if (!channel) return;
      channel.source.disconnect();
      channel.analyser.disconnect();
      channel.gain.disconnect();
      channels.delete(id);
    },

    setChannel: (id, settings) => {
      const channel = channels.get(id);
      if (!channel) return;
      // A short ramp instead of a hard set: stepping a gain value on a running
      // signal produces an audible click.
      const target = settings.isMuted ? 0 : settings.gain;
      channel.gain.gain.setTargetAtTime(target, context.currentTime, 0.015);
    },

    setMonitoring: (isMonitoring, volume) => {
      monitorGain.gain.setTargetAtTime(
        isMonitoring ? volume : 0,
        context.currentTime,
        0.015,
      );
    },

    readLevels: () => {
      const levels: Record<string, number> = {};
      channels.forEach((channel, id) => {
        channel.analyser.getByteTimeDomainData(channel.samples);
        let sum = 0;
        for (let index = 0; index < channel.samples.length; index += 1) {
          const value = (channel.samples[index] - 128) / 128;
          sum += value * value;
        }
        levels[id] = toDisplayLevel(Math.sqrt(sum / channel.samples.length));
      });
      return levels;
    },

    getOutputLatencyMs: () => {
      // `outputLatency` is absent in Safari, where baseLatency alone is the
      // best available answer.
      const output = (context as { outputLatency?: number }).outputLatency ?? 0;
      return Math.round((context.baseLatency + output) * 1000);
    },

    resume: () => context.resume().catch(() => undefined),

    dispose: () => {
      channels.forEach((channel) => {
        channel.source.disconnect();
        channel.analyser.disconnect();
        channel.gain.disconnect();
      });
      channels.clear();
      bus.disconnect();
      monitorGain.disconnect();
      recordDestination.disconnect();
      void context.close().catch(() => undefined);
    },
  };
};
