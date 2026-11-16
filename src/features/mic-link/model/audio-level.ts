export interface AudioLevelMonitor {
  // Round-trip cost of this device's own audio hardware and OS stack, in
  // milliseconds. Only meaningful once the context has actually rendered, so
  // read it a moment after starting rather than immediately.
  getOutputLatencyMs: () => number;
  stop: () => void;
}
