// Keeps the phone's screen awake while it is acting as a microphone.
//
// This is not a nicety: iOS Safari suspends `getUserMedia` capture the moment
// the screen locks, which silently kills the stream mid-session. The lock is
// also dropped whenever the tab is backgrounded, so it has to be re-acquired on
// every return to visibility.
//
// Typed locally rather than relying on lib.dom, whose WakeLock definitions vary
// between TypeScript versions.

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

interface WakeLockNavigator {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
}

export interface ScreenWakeLock {
  release: () => void;
}

export const isWakeLockSupported = (): boolean =>
  typeof navigator !== "undefined" &&
  Boolean((navigator as unknown as WakeLockNavigator).wakeLock);

export const requestScreenWakeLock = (): ScreenWakeLock => {
  const api = (navigator as unknown as WakeLockNavigator).wakeLock;
  let sentinel: WakeLockSentinelLike | null = null;
  let released = false;

  const acquire = async (): Promise<void> => {
    if (released || !api || document.visibilityState !== "visible") return;
    try {
      sentinel = await api.request("screen");
    } catch {
      // Denied or unsupported — the session still works, the screen just sleeps.
      sentinel = null;
    }
  };

  const handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") void acquire();
  };

  void acquire();
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return {
    release: () => {
      if (released) return;
      released = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void sentinel?.release().catch(() => undefined);
      sentinel = null;
    },
  };
};
