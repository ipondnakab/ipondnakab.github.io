import type {
  ScreenWakeLock,
  WakeLockNavigator,
  WakeLockSentinelLike,
} from "@/shared/types/screen-wake-lock";

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
