"use client";

import { useReducedMotion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import {
  MASCOT_ACTIONS,
  MASCOT_CANVAS_SIZE,
  MASCOT_HOVER_ROLL_LOOP_END,
  MASCOT_HOVER_ROLL_LOOP_START,
  MASCOT_SPRITE_HEIGHT,
  MASCOT_SPRITE_SRC,
  MASCOT_SPRITE_WIDTH,
} from "@/features/chat/constants";
import {
  chooseMascotAmbientAction,
  getMascotAmbientDelay,
  getMascotGroomDelay,
  resolveMascotAction,
} from "@/features/chat/lib/ambient-action";
import {
  chooseHoverRollRestTick,
  getHoverRollRestDelay,
  getNextHoverRollTick,
} from "@/features/chat/lib/hover-roll";
import {
  getMascotFrameDuration,
  getMascotSpriteFrame,
} from "@/features/chat/lib/sprite-frame";
import type {
  MascotActionEvent,
  MascotAmbientAction,
  MascotFacing,
  MascotState,
} from "@/features/chat/model/mascot";
import PixelKhunKao from "./PixelKhunKao";

export interface ChatMascotProps {
  state: MascotState;
  facing?: MascotFacing;
  onReady?: () => void;
  actionEvent?: MascotActionEvent | null;
  isHovered?: boolean;
}

const ChatMascot: React.FC<ChatMascotProps> = ({
  state,
  facing = "front",
  onReady,
  actionEvent,
  isHovered = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  const [atlas, setAtlas] = useState<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [ambientAction, setAmbientAction] =
    useState<MascotAmbientAction | null>(null);
  const [eventAction, setEventAction] = useState<MascotActionEvent | null>(
    null,
  );
  const [isRolling, setIsRolling] = useState(false);
  const hoveredRef = useRef(isHovered);
  const releaseHoverPauseRef = useRef<(() => void) | null>(null);
  const lastEventRef = useRef<number | null>(null);
  const ambientStateRef = useRef<MascotState | null>(null);
  const lastAmbientRef = useRef<MascotAmbientAction | null>(null);
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
    hoveredRef.current = isHovered;
    if (!isHovered) releaseHoverPauseRef.current?.();
    if (failed || state === "walking" || reducedMotion !== false) {
      setIsRolling(false);
    } else if (isHovered) {
      setIsRolling(true);
    } else if (eventAction) {
      // Leaving during a stretch should not start a fresh roll afterwards.
      setIsRolling(false);
    }
  }, [isHovered, failed, state, reducedMotion, eventAction]);

  useEffect(() => {
    if (!atlas) return;
    const fresh = actionEvent && actionEvent.id !== lastEventRef.current;
    if (fresh) lastEventRef.current = actionEvent.id;
    if (
      !actionEvent ||
      failed ||
      state === "walking" ||
      reducedMotion !== false
    ) {
      setEventAction(null);
    } else if (fresh) {
      setAmbientAction(null);
      setEventAction(actionEvent);
    } else if (state !== "idle") {
      setEventAction(null);
    }
  }, [actionEvent, atlas, failed, state, reducedMotion]);

  useEffect(() => {
    if (
      !atlas ||
      failed ||
      (state !== "idle" && state !== "thinking") ||
      reducedMotion !== false ||
      isRolling
    ) {
      ambientStateRef.current = null;
      setAmbientAction(null);
      return;
    }
    if (ambientStateRef.current !== state) {
      ambientStateRef.current = state;
      if (state === "thinking") {
        setAmbientAction("groom");
        return;
      }
      setAmbientAction(null);
    }
    if (ambientAction || eventAction) return;
    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      if (document.hidden) return;
      timer = window.setTimeout(
        () => {
          const action =
            state === "thinking"
              ? "groom"
              : chooseMascotAmbientAction(
                  Math.random(),
                  lastAmbientRef.current,
                );
          if (state === "idle") lastAmbientRef.current = action;
          setAmbientAction(action);
        },
        state === "thinking"
          ? getMascotGroomDelay(Math.random())
          : getMascotAmbientDelay(Math.random()),
      );
    };
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [
    atlas,
    failed,
    state,
    reducedMotion,
    ambientAction,
    eventAction,
    isRolling,
  ]);

  const rolling = isRolling && !eventAction;
  // Thinking uses finite grooming clips, with seated pauses between bursts.
  const playbackState =
    (eventAction || isRolling || state === "thinking") && state !== "walking"
      ? "idle"
      : state;
  const action = eventAction?.action ?? (isRolling ? "roll" : ambientAction);

  useEffect(() => {
    if (!atlas || failed || !canvasRef.current) return;
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
    const resolvedAction = resolveMascotAction(playbackState, action, still);
    const clip = MASCOT_ACTIONS[resolvedAction];
    let tick = 0;
    let restTick = chooseHoverRollRestTick(rolling ? Math.random() : 0);
    let resting = false;
    let frameDelay = getMascotFrameDuration(resolvedAction, tick);
    let timer: number | undefined;
    const draw = () => {
      const { source, destination } = getMascotSpriteFrame(
        playbackState,
        tick,
        still,
        action,
      );
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
    const advance = () => {
      const previous = tick;
      tick = rolling
        ? getNextHoverRollTick(tick, hoveredRef.current)
        : tick + 1;
      if (
        rolling &&
        previous === MASCOT_HOVER_ROLL_LOOP_END &&
        tick === MASCOT_HOVER_ROLL_LOOP_START
      ) {
        restTick = chooseHoverRollRestTick(Math.random());
      }
      if (tick % clip.frames.length === 0) {
        if (rolling && !hoveredRef.current) {
          setIsRolling(false);
          return;
        }
        if (
          eventAction ||
          (!rolling && playbackState === "idle" && ambientAction)
        ) {
          setAmbientAction(null);
          setEventAction(null);
          return;
        }
      }
      draw();
      resting = rolling && hoveredRef.current && tick === restTick;
      frameDelay = resting
        ? getHoverRollRestDelay(Math.random())
        : getMascotFrameDuration(resolvedAction, tick);
      timer = window.setTimeout(advance, frameDelay);
    };
    const synchronize = () => {
      window.clearTimeout(timer);
      if (resting && !hoveredRef.current) {
        resting = false;
        frameDelay = getMascotFrameDuration(resolvedAction, tick);
      }
      if (document.hidden || still) return;
      timer = window.setTimeout(advance, frameDelay);
    };
    releaseHoverPauseRef.current = () => {
      if (resting) synchronize();
    };
    draw();
    onReadyRef.current?.();
    document.addEventListener("visibilitychange", synchronize);
    synchronize();
    return () => {
      releaseHoverPauseRef.current = null;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", synchronize);
    };
  }, [
    atlas,
    failed,
    playbackState,
    action,
    facing,
    reducedMotion,
    ambientAction,
    eventAction,
    rolling,
  ]);

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
