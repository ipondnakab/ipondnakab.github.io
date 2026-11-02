export type MascotState = "idle" | "thinking" | "replying" | "walking";

export type MascotFacing = "front" | "left" | "right";
export type MascotPhase =
  "closed" | "loading" | "entering" | "active" | "exiting";

export interface SpriteRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteSourceFrame extends SpriteRectangle {
  anchorX: number;
  baseline: number;
}

export interface MascotSpriteFrame {
  source: SpriteRectangle;
  destination: SpriteRectangle;
  baseline: number;
}
