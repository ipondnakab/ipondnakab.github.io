import {
  MASCOT_ACTIONS,
  MASCOT_CANVAS_SIZE,
  MASCOT_SOURCE_FRAMES,
  MASCOT_SPRITE_BASELINE,
  MASCOT_SPRITE_HEIGHT,
  MASCOT_SPRITE_SCALE,
  MASCOT_SPRITE_WIDTH,
} from "@/features/chat/constants";
import type {
  MascotAction,
  MascotAmbientAction,
  MascotSpriteFrame,
  MascotState,
} from "@/features/chat/model/mascot";

import { resolveMascotAction } from "./ambient-action";

export const getMascotSpriteFrame = (
  state: MascotState,
  tick: number,
  reducedMotion: boolean,
  ambientAction: MascotAmbientAction | null = null,
): MascotSpriteFrame => {
  const clip =
    MASCOT_ACTIONS[resolveMascotAction(state, ambientAction, reducedMotion)];
  const sequence = clip.frames;
  const scale = MASCOT_SPRITE_SCALE * clip.scale;
  const index = reducedMotion
    ? 0
    : sequence[Math.max(0, Math.floor(tick)) % sequence.length];
  const frame = MASCOT_SOURCE_FRAMES[index];
  const padding = 2;
  const x = Math.max(0, frame.x - padding);
  const y = Math.max(0, frame.y - padding);
  const source = {
    x,
    y,
    width: Math.min(MASCOT_SPRITE_WIDTH, frame.x + frame.width + padding) - x,
    height:
      Math.min(MASCOT_SPRITE_HEIGHT, frame.y + frame.height + padding) - y,
  };

  return {
    source,
    destination: {
      x: MASCOT_CANVAS_SIZE / 2 + (x - frame.anchorX) * scale,
      y: MASCOT_SPRITE_BASELINE + (y - frame.baseline) * scale,
      width: source.width * scale,
      height: source.height * scale,
    },
    baseline: frame.baseline,
  };
};

export const getMascotFrameDuration = (
  action: MascotAction,
  tick: number,
): number => {
  const clip = MASCOT_ACTIONS[action];
  const index = Math.max(0, Math.floor(tick)) % clip.frames.length;
  return clip.frameDurations?.[index] ?? clip.frameMs;
};
