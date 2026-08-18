"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";

import { ensureAnalytics, trackPageView } from "@/shared/lib/analytics";

// Initialises Firebase Analytics and reports client-side route changes as GA4
// `page_view` events. Renders nothing.
const AnalyticsProvider: React.FC = () => {
  const pathname = usePathname();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Firebase Analytics emits the first page_view automatically on init, so
    // skip the initial render and only report subsequent SPA navigations.
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      ensureAnalytics();
      return;
    }
    trackPageView(pathname);
  }, [pathname]);

  return null;
};

export default AnalyticsProvider;
