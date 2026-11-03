import type {
  MascotAction,
  MascotAmbientAction,
  MascotClip,
  SpriteSourceFrame,
} from "@/features/chat/model/mascot";

export const MASCOT_AVATAR_SRC = "/images/khunkao-avatar.png";
export const MASCOT_INTRO_DURATION_MS = 3000;
export const MASCOT_REPLY_DURATION_MS = 2400;
export const MASCOT_TRAVEL_DURATION_MS = 1200;
export const MASCOT_SPRITE_SRC = "/images/khunkao/tabby-atlas-v5.png";
export const MASCOT_SPRITE_WIDTH = 953;
export const MASCOT_SPRITE_HEIGHT = 1651;
export const MASCOT_CANVAS_SIZE = 112;
export const MASCOT_SPRITE_SCALE = 0.44;
export const MASCOT_SPRITE_BASELINE = 108;

export const MASCOT_AMBIENT_ACTIONS: readonly MascotAmbientAction[] = [
  "roll",
  "groom",
  "stretch",
  "expression",
];
// Indices in the roll clip: lower once, tumble on the ground, then recover.
export const MASCOT_HOVER_ROLL_LOOP_START = 2;
export const MASCOT_HOVER_ROLL_LOOP_END = 5;
export const MASCOT_HOVER_REST_TICKS: readonly number[] = [2, 5];
export const MASCOT_HOVER_REST_MIN_MS = 1200;
export const MASCOT_HOVER_REST_MAX_MS = 3200;
export const MASCOT_AMBIENT_MIN_MS = 8000;
export const MASCOT_AMBIENT_MAX_MS = 16000;
export const MASCOT_GROOM_MIN_MS = 1500;
export const MASCOT_GROOM_MAX_MS = 4500;

export const MASCOT_ACTIONS: Record<MascotAction, MascotClip> = {
  sit: {
    frames: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0],
    frameMs: 180,
    scale: 1,
  },
  walk: { frames: [4, 5, 6, 7, 8, 9, 10, 11], frameMs: 125, scale: 1.09 },
  groom: { frames: [12, 13, 14, 13, 14, 15, 0], frameMs: 220, scale: 1 },
  stretch: { frames: [16, 17, 18, 19, 0], frameMs: 250, scale: 1 },
  roll: {
    frames: [0, 21, 22, 23, 24, 25, 26, 27, 0],
    frameMs: 180,
    frameDurations: [260, 220, 300, 220, 220, 300, 220, 260, 360],
    scale: 1,
  },
  expression: { frames: [28, 29, 30, 31, 28, 0], frameMs: 250, scale: 1 },
};

// Bounds include translucent whiskers. One column anchor and per-pose contact
// points keep the cat centred and grounded, including lying/rolling poses.
export const MASCOT_SOURCE_FRAMES: readonly SpriteSourceFrame[] = [
  {
    x: 38,
    y: 16,
    width: 152,
    height: 187,
    anchorX: 117,
    baseline: 202,
  },
  {
    x: 278,
    y: 16,
    width: 151,
    height: 187,
    anchorX: 355.25,
    baseline: 202,
  },
  {
    x: 518,
    y: 16,
    width: 148,
    height: 187,
    anchorX: 593.5,
    baseline: 202,
  },
  {
    x: 756,
    y: 16,
    width: 150,
    height: 188,
    anchorX: 831.75,
    baseline: 202,
  },
  {
    x: 8,
    y: 235,
    width: 204,
    height: 169,
    anchorX: 117,
    baseline: 403,
  },
  {
    x: 241,
    y: 234,
    width: 212,
    height: 170,
    anchorX: 355.25,
    baseline: 403,
  },
  {
    x: 480,
    y: 234,
    width: 213,
    height: 173,
    anchorX: 593.5,
    baseline: 405,
  },
  {
    x: 720,
    y: 234,
    width: 213,
    height: 173,
    anchorX: 831.75,
    baseline: 406,
  },
  {
    x: 8,
    y: 440,
    width: 206,
    height: 172,
    anchorX: 117,
    baseline: 611,
  },
  {
    x: 245,
    y: 440,
    width: 210,
    height: 172,
    anchorX: 355.25,
    baseline: 611,
  },
  {
    x: 484,
    y: 441,
    width: 211,
    height: 171,
    anchorX: 593.5,
    baseline: 611,
  },
  {
    x: 725,
    y: 441,
    width: 210,
    height: 171,
    anchorX: 831.75,
    baseline: 611,
  },
  {
    x: 39,
    y: 635,
    width: 150,
    height: 187,
    anchorX: 117,
    baseline: 821,
  },
  {
    x: 278,
    y: 635,
    width: 152,
    height: 187,
    anchorX: 355.25,
    baseline: 821,
  },
  {
    x: 518,
    y: 635,
    width: 150,
    height: 187,
    anchorX: 593.5,
    baseline: 821,
  },
  {
    x: 756,
    y: 635,
    width: 151,
    height: 187,
    anchorX: 831.75,
    baseline: 821,
  },
  {
    x: 12,
    y: 848,
    width: 199,
    height: 183,
    anchorX: 117,
    baseline: 1030,
  },
  {
    x: 236,
    y: 846,
    width: 228,
    height: 184,
    anchorX: 355.25,
    baseline: 1029,
  },
  {
    x: 477,
    y: 849,
    width: 222,
    height: 180,
    anchorX: 593.5,
    baseline: 1028,
  },
  {
    x: 725,
    y: 848,
    width: 196,
    height: 183,
    anchorX: 831.75,
    baseline: 1029,
  },
  {
    x: 35,
    y: 1054,
    width: 153,
    height: 173,
    anchorX: 117,
    baseline: 1226,
  },
  {
    x: 242,
    y: 1101,
    width: 206,
    height: 123,
    anchorX: 355.25,
    baseline: 1223,
  },
  {
    x: 472,
    y: 1103,
    width: 223,
    height: 119,
    anchorX: 593.5,
    baseline: 1221,
  },
  {
    x: 712,
    y: 1103,
    width: 234,
    height: 117,
    anchorX: 831.75,
    baseline: 1218,
  },
  {
    x: 12,
    y: 1284,
    width: 227,
    height: 112,
    anchorX: 117,
    baseline: 1395,
  },
  {
    x: 248,
    y: 1292,
    width: 213,
    height: 107,
    anchorX: 355.25,
    baseline: 1398,
  },
  {
    x: 484,
    y: 1266,
    width: 214,
    height: 138,
    anchorX: 593.5,
    baseline: 1402,
  },
  {
    x: 745,
    y: 1248,
    width: 165,
    height: 164,
    anchorX: 831.75,
    baseline: 1411,
  },
  {
    x: 39,
    y: 1456,
    width: 151,
    height: 186,
    anchorX: 117,
    baseline: 1641,
  },
  {
    x: 278,
    y: 1456,
    width: 150,
    height: 186,
    anchorX: 355.25,
    baseline: 1641,
  },
  {
    x: 519,
    y: 1456,
    width: 148,
    height: 186,
    anchorX: 593.5,
    baseline: 1641,
  },
  {
    x: 757,
    y: 1445,
    width: 146,
    height: 197,
    anchorX: 831.75,
    baseline: 1641,
  },
];
