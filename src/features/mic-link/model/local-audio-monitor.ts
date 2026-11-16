export interface LocalAudioMonitor {
  setVolume: (volume: number) => void;
  stop: () => void;
}
