"use client";

import { useReducedMotion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import {
  MASCOT_CANVAS_SIZE,
  MASCOT_FRAME_DURATION_MS,
  MASCOT_SPRITE_HEIGHT,
  MASCOT_SPRITE_SRC,
  MASCOT_SPRITE_WIDTH,
} from "@/features/chat/constants";
import { getMascotSpriteFrame } from "@/features/chat/lib/sprite-frame";
import type { MascotFacing, MascotState } from "@/features/chat/model/mascot";
import PixelKhunKao from "./PixelKhunKao";

export interface ChatMascotProps {
  state: MascotState;
  facing?: MascotFacing;
  onReady?: () => void;
}

const ChatMascot: React.FC<ChatMascotProps> = ({
  state,
  facing = "front",
  onReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  const [atlas, setAtlas] = useState<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const image = new window.Image();
    let cancelled = false;
    let settled = false;
    const finish = (success: boolean) => {
      if (cancelled || settled) return;
      settled = true;
      if (
        success &&
        image.naturalWidth === MASCOT_SPRITE_WIDTH &&
        image.naturalHeight === MASCOT_SPRITE_HEIGHT
      ) {
        setAtlas(image);
      } else {
        setFailed(true);
        onReadyRef.current?.();
      }
    };
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = MASCOT_SPRITE_SRC;
    if (image.complete && image.naturalWidth) finish(true);
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!atlas || !canvasRef.current) return;
    let context: CanvasRenderingContext2D | null = null;
    try {
      context = canvasRef.current.getContext("2d");
    } catch {
      /* Use the pixel fallback if canvas is disabled. */
    }
    if (!context) {
      setFailed(true);
      onReadyRef.current?.();
      return;
    }
    const painter = context;
    const still = reducedMotion !== false;
    const mirrored = facing !== "right";
    let tick = 0;
    let timer: number | undefined;
    const draw = () => {
      const { source, destination } = getMascotSpriteFrame(state, tick, still);
      painter.clearRect(0, 0, MASCOT_CANVAS_SIZE, MASCOT_CANVAS_SIZE);
      painter.imageSmoothingEnabled = false;
      painter.save();
      painter.translate(mirrored ? MASCOT_CANVAS_SIZE : 0, 0);
      painter.scale(mirrored ? -1 : 1, 1);
      painter.drawImage(
        atlas,
        source.x,
        source.y,
        source.width,
        source.height,
        destination.x,
        destination.y,
        destination.width,
        destination.height,
      );
      painter.restore();
    };
    const synchronize = () => {
      window.clearInterval(timer);
      if (document.hidden || still) return;
      timer = window.setInterval(() => {
        tick += 1;
        draw();
      }, MASCOT_FRAME_DURATION_MS[state]);
    };
    draw();
    onReadyRef.current?.();
    document.addEventListener("visibilitychange", synchronize);
    synchronize();
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", synchronize);
    };
  }, [atlas, state, facing, reducedMotion]);

  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {(!atlas || failed) && (
        <PixelKhunKao
          state={state}
          className="absolute inset-0 h-full w-full"
        />
      )}
      <canvas
        ref={canvasRef}
        width={MASCOT_CANVAS_SIZE}
        height={MASCOT_CANVAS_SIZE}
        className={
          atlas && !failed ? "h-full w-full" : "invisible h-full w-full"
        }
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};

export default ChatMascot;
