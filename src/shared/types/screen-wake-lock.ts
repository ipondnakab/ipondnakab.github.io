// Keeps the phone's screen awake while it is acting as a microphone.
//
// This is not a nicety: iOS Safari suspends `getUserMedia` capture the moment
// the screen locks, which silently kills the stream mid-session. The lock is
// also dropped whenever the tab is backgrounded, so it has to be re-acquired on
// every return to visibility.
//
// Typed locally rather than relying on lib.dom, whose WakeLock definitions vary
// between TypeScript versions.

export interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

export interface WakeLockNavigator {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
}

export interface ScreenWakeLock {
  release: () => void;
}
