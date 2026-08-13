"use client";

import React, { useEffect, useRef } from "react";

export interface MicLinkStreamSinkProps {
  stream: MediaStream;
  muted: boolean;
  volume: number;
}

// An <audio> element for one incoming stream, doing two jobs.
//
// Always: it works around a long-standing Chrome behaviour where a remote
// WebRTC stream is not pumped into Web Audio at all unless it is also attached
// to a playing media element. Without it the mixer would receive silence and
// every meter would sit at zero. That is why it stays mounted and playing even
// when nothing is meant to be audible.
//
// In low-latency mode: it also becomes the playback path. Routing audio through
// `createMediaStreamSource` costs buffering on top of the receive jitter
// buffer, so when delay matters more than precise mixing, the element plays
// directly and the mixer's monitor output is silenced instead. Gain is then
// applied per element rather than per channel, which caps it at 1x — element
// volume has no headroom above unity.
const MicLinkStreamSink: React.FC<MicLinkStreamSinkProps> = ({
  stream,
  muted,
  volume,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.srcObject = stream;
    // Start muted regardless of the requested state: muted playback is the one
    // thing autoplay policy always permits, so this can never be blocked. The
    // effect below unmutes in the same commit if it should be audible, and
    // unmuting an already-playing element needs no further permission.
    audio.muted = true;
    void audio.play().catch(() => undefined);

    return () => {
      audio.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = Math.min(1, Math.max(0, volume));
  }, [muted, volume]);

  return <audio ref={audioRef} playsInline className="hidden" />;
};

export default MicLinkStreamSink;
