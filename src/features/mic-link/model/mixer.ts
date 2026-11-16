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

export interface MixerChannel {
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  gain: GainNode;
  // Explicitly backed by ArrayBuffer (not the wider ArrayBufferLike): the
  // analyser's read methods reject a possibly-shared buffer.
  samples: Uint8Array<ArrayBuffer>;
}
