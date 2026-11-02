import type {
  MascotState,
  SpriteSourceFrame,
} from "@/features/chat/model/mascot";

export const MASCOT_REPLY_DURATION_MS = 2400;
export const MASCOT_TRAVEL_DURATION_MS = 1200;

export const MASCOT_SPRITE_SRC = "/images/khunkao/tabby-atlas-v2.png";
export const MASCOT_SPRITE_WIDTH = 1254;
export const MASCOT_SPRITE_HEIGHT = 1254;
export const MASCOT_CANVAS_SIZE = 112;
export const MASCOT_SPRITE_SCALE = 0.35;
export const MASCOT_SPRITE_BASELINE = 108;

export const MASCOT_ANIMATION_FRAMES: Record<MascotState, readonly number[]> = {
  idle: [0, 0, 0, 0, 0, 1, 2, 3, 0, 0],
  walking: [4, 5, 6, 7, 8, 9, 10, 11],
  thinking: [12, 13, 14, 15],
  replying: [2, 3, 1, 2, 3, 0],
};

export const MASCOT_FRAME_DURATION_MS: Record<MascotState, number> = {
  idle: 250,
  walking: 125,
  thinking: 240,
  replying: 180,
};

// Measured visible bounds include translucent whiskers. Column-centre anchors
// and paw baselines keep the scale and ground line stable across poses.
export const MASCOT_SOURCE_FRAMES: readonly SpriteSourceFrame[] = [
  {
    x: 26,
    y: 63,
    width: 285,
    height: 243,
    anchorX: 170,
    baseline: 305,
  },
  {
    x: 339,
    y: 63,
    width: 286,
    height: 243,
    anchorX: 483.5,
    baseline: 305,
  },
  {
    x: 652,
    y: 63,
    width: 285,
    height: 243,
    anchorX: 797,
    baseline: 305,
  },
  {
    x: 964,
    y: 63,
    width: 288,
    height: 243,
    anchorX: 1110.5,
    baseline: 305,
  },
  {
    x: 20,
    y: 360,
    width: 304,
    height: 237,
    anchorX: 170,
    baseline: 596,
  },
  {
    x: 336,
    y: 360,
    width: 301,
    height: 237,
    anchorX: 483.5,
    baseline: 596,
  },
  {
    x: 649,
    y: 360,
    width: 300,
    height: 237,
    anchorX: 797,
    baseline: 596,
  },
  {
    x: 964,
    y: 359,
    width: 290,
    height: 238,
    anchorX: 1110.5,
    baseline: 596,
  },
  {
    x: 18,
    y: 671,
    width: 304,
    height: 234,
    anchorX: 170,
    baseline: 903,
  },
  {
    x: 335,
    y: 668,
    width: 297,
    height: 237,
    anchorX: 483.5,
    baseline: 903,
  },
  {
    x: 650,
    y: 671,
    width: 299,
    height: 234,
    anchorX: 797,
    baseline: 903,
  },
  {
    x: 964,
    y: 671,
    width: 290,
    height: 234,
    anchorX: 1110.5,
    baseline: 903,
  },
  {
    x: 18,
    y: 955,
    width: 299,
    height: 236,
    anchorX: 170,
    baseline: 1190,
  },
  {
    x: 334,
    y: 957,
    width: 293,
    height: 234,
    anchorX: 483.5,
    baseline: 1190,
  },
  {
    x: 648,
    y: 955,
    width: 290,
    height: 236,
    anchorX: 797,
    baseline: 1190,
  },
  {
    x: 962,
    y: 955,
    width: 290,
    height: 236,
    anchorX: 1110.5,
    baseline: 1190,
  },
];
