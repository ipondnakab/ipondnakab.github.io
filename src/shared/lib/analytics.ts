import {
  Analytics,
  getAnalytics,
  isSupported,
  logEvent,
} from "firebase/analytics";

import { app } from "@/libs/firebase";

// Firebase Analytics (Google Analytics 4) only runs in the browser, and only
// when the environment supports it — it is unavailable during SSR/build and in
// some privacy modes. This module lazily initialises it and exposes helpers
// that silently no-op when analytics is unavailable, so callers never need to
// guard themselves.

let analyticsPromise: Promise<Analytics | null> | null = null;
// Cached once resolved, so trackEvent can fire synchronously afterwards. That
// matters for clicks that immediately unload the page (outbound links, nav
// full-reloads): a synchronous logEvent reaches gtag's beacon transport before
// the browser navigates away, whereas an awaited one can be dropped.
let analyticsInstance: Analytics | null = null;

const initAnalytics = (): Promise<Analytics | null> => {
  if (analyticsPromise) return analyticsPromise;
  analyticsPromise = (async () => {
    if (typeof window === "undefined") return null;
    if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;
    try {
      analyticsInstance = (await isSupported()) ? getAnalytics(app) : null;
    } catch {
      analyticsInstance = null;
    }
    return analyticsInstance;
  })();
  return analyticsPromise;
};

// Initialise Firebase Analytics (which also emits the automatic first
// `page_view`). Safe to call on the client; no-ops on the server.
export const ensureAnalytics = (): void => {
  void initAnalytics();
};

// Log a custom analytics event. Silently no-ops when analytics is unavailable.
// Fires synchronously once analytics is initialised; otherwise waits for init.
export const trackEvent = (
  name: string,
  params?: Record<string, unknown>,
): void => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, name, params);
    return;
  }
  void initAnalytics().then((analytics) => {
    if (analytics) logEvent(analytics, name, params);
  });
};

// Log a client-side navigation as a GA4 `page_view`. Call only in the browser.
export const trackPageView = (path: string): void =>
  trackEvent("page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
