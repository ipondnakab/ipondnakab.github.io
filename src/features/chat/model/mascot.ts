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

export type MascotAmbientAction = "roll" | "groom" | "stretch" | "expression";
export type MascotAction = "sit" | "walk" | MascotAmbientAction;

export interface MascotClip {
  frames: readonly number[];
  frameMs: number;
  frameDurations?: readonly number[];
  scale: number;
}

export interface MascotActionEvent {
  id: number;
  action: "roll" | "stretch";
}
