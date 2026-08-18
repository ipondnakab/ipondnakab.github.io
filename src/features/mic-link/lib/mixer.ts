// A small Web Audio mixer for the receiver.
//
// Every connected phone becomes one channel. The channels are summed into a
// single bus that feeds two places: a MediaStreamDestination (what gets
// recorded, so the recording always reflects the fader positions) and a monitor
// gain node wired to the speakers (which the master volume controls, so turning
// monitoring down never affects the recording).
//
//   stream -> source -> analyser (pre-fader meter)
//                    -> channelGain -> bus -> recordDestination -> MediaRecorder
//                                          -> monitorGain -> speakers
//
// The meter is deliberately tapped *before* the fader: you want to see that
// someone is talking even while their channel is muted.

export interface MicLinkChannelSettings {
  gain: number;
  isMuted: boolean;
}

export interface MicLinkMixer {
  addInput: (id: string, stream: MediaStream) => void;
  removeInput: (id: string) => void;
  setChannel: (id: string, settings: MicLinkChannelSettings) => void;
  setMonitoring: (isMonitoring: boolean, volume: number) => void;
  // Instantaneous 0..1 level per channel, read once per animation frame by the
  // UI so a single loop drives every meter.
  readLevels: () => Record<string, number>;
  // The mixed-down stream to hand to MediaRecorder.
  recordingStream: MediaStream;
  // Web Audio render quantum plus the OS output buffer, in milliseconds — the
  // last leg of the delay between someone speaking and the sound coming out.
  getOutputLatencyMs: () => number;
  resume: () => Promise<void>;
  dispose: () => void;
}

interface MixerChannel {
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  gain: GainNode;
  // Explicitly backed by ArrayBuffer (not the wider ArrayBufferLike): the
  // analyser's read methods reject a possibly-shared buffer.
  samples: Uint8Array<ArrayBuffer>;
}

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
