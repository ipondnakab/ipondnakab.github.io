"use client";

import React, { useEffect, useRef } from "react";

export interface MicLinkStreamSinkProps {
  stream: MediaStream;
}

// A permanently-muted <audio> element for one incoming stream.
//
// It exists purely to work around a long-standing Chrome behaviour: a remote
// WebRTC stream is not pumped into Web Audio at all unless it is also attached
// to a playing media element. Without this the mixer would receive silence and
// every meter would sit at zero. Playback for the user goes through the mixer's
// monitor path instead, which is why this stays muted — otherwise every phone
// would be audible twice.
const MicLinkStreamSink: React.FC<MicLinkStreamSinkProps> = ({ stream }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.srcObject = stream;
    audio.muted = true;
    // Muted playback is the one thing autoplay policy always permits, so this
    // can never be blocked even on a page that has seen no user gesture.
    void audio.play().catch(() => undefined);

    return () => {
      audio.srcObject = null;
    };
  }, [stream]);

  return <audio ref={audioRef} playsInline muted className="hidden" />;
};

export default MicLinkStreamSink;
