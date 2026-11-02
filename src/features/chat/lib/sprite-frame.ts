import {
  MASCOT_ANIMATION_FRAMES,
  MASCOT_CANVAS_SIZE,
  MASCOT_SOURCE_FRAMES,
  MASCOT_SPRITE_BASELINE,
  MASCOT_SPRITE_HEIGHT,
  MASCOT_SPRITE_SCALE,
  MASCOT_SPRITE_WIDTH,
} from "@/features/chat/constants";
import type {
  MascotSpriteFrame,
  MascotState,
} from "@/features/chat/model/mascot";

export const getMascotSpriteFrame = (
  state: MascotState,
  tick: number,
  reducedMotion: boolean,
): MascotSpriteFrame => {
  const sequence = MASCOT_ANIMATION_FRAMES[state];
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
      x: MASCOT_CANVAS_SIZE / 2 + (x - frame.anchorX) * MASCOT_SPRITE_SCALE,
      y: MASCOT_SPRITE_BASELINE + (y - frame.baseline) * MASCOT_SPRITE_SCALE,
      width: source.width * MASCOT_SPRITE_SCALE,
      height: source.height * MASCOT_SPRITE_SCALE,
    },
    baseline: frame.baseline,
  };
};
