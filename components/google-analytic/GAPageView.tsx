"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const GAPageView: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      const url =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : "");

      window.gtag("event", "page_view", {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
};

export default GAPageView;
