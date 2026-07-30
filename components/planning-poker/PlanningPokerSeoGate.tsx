"use client";

import React, { useEffect, useState } from "react";

export interface PlanningPokerSeoGateProps {
  children: React.ReactNode;
}

// The SEO content is server-rendered into the static HTML (so search engines
// index it) and is shown on the /planning landing page. Once a visitor is in an
// actual room (?room=...), it's hidden so marketing copy doesn't sit under the
// live estimation table. Rendering the children by default keeps them in the
// prerendered HTML and in Googlebot's render of the canonical /planning URL
// (which has no room param) — the hide only happens client-side, post-mount, so
// there's no hydration mismatch and no loss of crawlable content.
const PlanningPokerSeoGate: React.FC<PlanningPokerSeoGateProps> = ({
  children,
}) => {
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInRoom(Boolean(params.get("room")));
  }, []);

  if (inRoom) return null;
  return <>{children}</>;
};

export default PlanningPokerSeoGate;
