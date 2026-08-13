import type { Metadata } from "next";
import { Suspense } from "react";

import MicLink from "@/components/mic-link/MicLink";

const TITLE =
  "Mic Link — Use Your Phone as a Wireless Microphone in the Browser";
const DESCRIPTION =
  "Turn your phone into a wireless microphone for any device on the same network. Scan a QR code and the audio streams peer-to-peer over WebRTC — no app, no install, no cables.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "phone as microphone",
    "wireless microphone browser",
    "use phone as mic",
    "webrtc microphone",
    "phone microphone over wifi",
    "browser microphone streaming",
    "remote microphone",
    "phone mic to pc",
  ],
  alternates: { canonical: "/mic-link" },
  openGraph: {
    type: "website",
    url: "/mic-link",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const MicLinkPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MicLink />
    </Suspense>
  );
};

export default MicLinkPage;
