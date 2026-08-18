"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback } from "react";

import { MIC_LINK_MIC_PARAM, MIC_LINK_ROOM_PARAM } from "@/constants/mic-link";
import { createMicLinkRoomId } from "@/functions/mic-link-room-id";
import MicLinkLobby from "./MicLinkLobby";
import MicLinkReceiver from "./MicLinkReceiver";
import MicLinkSender from "./MicLinkSender";

const MIC_LINK_PATH = "/mic-link";

// Which device you are is decided entirely by the URL:
//   /mic-link                     -> lobby
//   /mic-link?room=ABC123         -> receiver (the device that plays/records)
//   /mic-link?room=ABC123&mic=1   -> sender (the phone, opened via the QR code)
const MicLink: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomId = searchParams.get(MIC_LINK_ROOM_PARAM);
  const isMicrophone = searchParams.get(MIC_LINK_MIC_PARAM) === "1";

  const handleStart = useCallback(() => {
    const nextRoom = createMicLinkRoomId();
    router.replace(`${MIC_LINK_PATH}?${MIC_LINK_ROOM_PARAM}=${nextRoom}`);
  }, [router]);

  // Leaving the route unmounts the receiver, whose cleanup closes the peer
  // connection and deletes the room — which is what invalidates the QR code.
  const handleEnd = useCallback(() => {
    router.replace(MIC_LINK_PATH);
  }, [router]);

  if (!roomId) return <MicLinkLobby onStart={handleStart} />;
  if (isMicrophone) return <MicLinkSender roomId={roomId} />;
  return <MicLinkReceiver roomId={roomId} onEnd={handleEnd} />;
};

export default MicLink;
