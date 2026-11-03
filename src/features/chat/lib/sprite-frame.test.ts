import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  MASCOT_ACTIONS,
  MASCOT_SPRITE_HEIGHT,
  MASCOT_SPRITE_SCALE,
  MASCOT_SPRITE_SRC,
  MASCOT_SPRITE_WIDTH,
} from "@/features/chat/constants";
import {
  getMascotFrameDuration,
  getMascotSpriteFrame,
} from "@/features/chat/lib/sprite-frame";

describe("tabby sprite playback", () => {
  it("walks through eight distinct poses and loops seamlessly", () => {
    const frames = Array.from({ length: 8 }, (_, tick) =>
      getMascotSpriteFrame("walking", tick, false),
    );
    expect(
      new Set(frames.map((frame) => `${frame.source.x},${frame.source.y}`))
        .size,
    ).toBe(8);
    expect(getMascotSpriteFrame("walking", 8, false)).toEqual(frames[0]);
  });

  it("keeps every frame in bounds, at the same scale and on the same ground line", () => {
    for (const state of ["idle", "walking", "thinking", "replying"] as const) {
      for (let tick = 0; tick < 16; tick++) {
        const { source, destination, baseline } = getMascotSpriteFrame(
          state,
          tick,
          false,
        );
        expect(source.x).toBeGreaterThanOrEqual(0);
        expect(source.y).toBeGreaterThanOrEqual(0);
        expect(source.x + source.width).toBeLessThanOrEqual(
          MASCOT_SPRITE_WIDTH,
        );
        expect(source.y + source.height).toBeLessThanOrEqual(
          MASCOT_SPRITE_HEIGHT,
        );
        expect(destination.x).toBeGreaterThanOrEqual(0);
        expect(destination.y).toBeGreaterThanOrEqual(0);
        expect(destination.x + destination.width).toBeLessThanOrEqual(112);
        expect(destination.y + destination.height).toBeLessThanOrEqual(112);
        const scale = destination.width / source.width;
        expect(destination.height / source.height).toBeCloseTo(scale);
        expect(scale).toBeCloseTo(
          MASCOT_SPRITE_SCALE *
            (state === "walking" ? MASCOT_ACTIONS.walk.scale : 1),
        );
        expect(destination.y + (baseline - source.y) * scale).toBeCloseTo(108);
      }
    }
  });

  it("keeps walking and seated idle at the same visible height", () => {
    const idle = getMascotSpriteFrame("idle", 0, false).destination;
    const idleHeight = idle.height;
    for (const state of ["walking", "thinking"] as const) {
      for (let tick = 0; tick < 16; tick++) {
        const height = getMascotSpriteFrame(state, tick, false).destination
          .height;
        const tolerance = state === "walking" ? 0.02 : 0.05;
        expect(height / idleHeight).toBeGreaterThanOrEqual(1 - tolerance);
        expect(height / idleHeight).toBeLessThanOrEqual(1 + tolerance);
        const frame = getMascotSpriteFrame(state, tick, false);
        expect(frame.destination.width / frame.source.width).toBeCloseTo(
          frame.destination.height / frame.source.height,
        );
      }
    }
  });

  it("uses grooming poses when thinking and one still pose for reduced motion", () => {
    expect(getMascotSpriteFrame("thinking", 0, false)).toEqual(
      getMascotSpriteFrame("idle", 0, false, "groom"),
    );
    const still = getMascotSpriteFrame("idle", 0, true);
    for (const state of ["idle", "walking", "thinking", "replying"] as const) {
      expect(getMascotSpriteFrame(state, 17, true)).toEqual(still);
    }
  });

  it("keeps all playful poses inside the canvas without stretching lower silhouettes", () => {
    for (const action of ["roll", "groom", "stretch", "expression"] as const) {
      for (let tick = 0; tick < MASCOT_ACTIONS[action].frames.length; tick++) {
        const { source, destination, baseline } = getMascotSpriteFrame(
          "idle",
          tick,
          false,
          action,
        );
        const scale = destination.width / source.width;
        expect(destination.height / source.height).toBeCloseTo(scale);
        expect(destination.x).toBeGreaterThanOrEqual(0);
        expect(destination.y).toBeGreaterThanOrEqual(0);
        expect(destination.x + destination.width).toBeLessThanOrEqual(112);
        expect(destination.y + destination.height).toBeLessThanOrEqual(112);
        expect(destination.y + (baseline - source.y) * scale).toBeCloseTo(108);
      }
    }
    expect(
      getMascotSpriteFrame("idle", 3, false, "roll").destination.height,
    ).toBeLessThan(getMascotSpriteFrame("idle", 0, false).destination.height);
  });

  it("matches the real transparent PNG dimensions used by its crop metadata", () => {
    const bytes = readFileSync(
      resolve(process.cwd(), "public", MASCOT_SPRITE_SRC.slice(1)),
    );
    expect(bytes.subarray(1, 4).toString()).toBe("PNG");
    expect(bytes.readUInt32BE(16)).toBe(MASCOT_SPRITE_WIDTH);
    expect(bytes.readUInt32BE(20)).toBe(MASCOT_SPRITE_HEIGHT);
    expect(bytes[25]).toBe(6);
  });
});

describe("natural sprite timing", () => {
  it("uses the same seated pose at the roll seam as resting idle", () => {
    const seated = getMascotSpriteFrame("idle", 0, false);
    expect(getMascotSpriteFrame("idle", 0, false, "roll")).toEqual(seated);
    expect(
      getMascotSpriteFrame(
        "idle",
        MASCOT_ACTIONS.roll.frames.length - 1,
        false,
        "roll",
      ),
    ).toEqual(seated);
  });

  it("gives roll preparation and recovery more time than the middle tumble", () => {
    const last = MASCOT_ACTIONS.roll.frames.length - 1;
    const groundMovement = [2, 3, 4, 5].reduce(
      (duration, tick) => duration + getMascotFrameDuration("roll", tick),
      0,
    );
    expect(groundMovement).toBeGreaterThanOrEqual(1000);
    expect(getMascotFrameDuration("roll", 0)).toBeGreaterThan(
      getMascotFrameDuration("roll", 3),
    );
    expect(getMascotFrameDuration("roll", last)).toBeGreaterThan(
      getMascotFrameDuration("roll", 3),
    );
    expect(getMascotFrameDuration("roll", last + 1)).toBe(
      getMascotFrameDuration("roll", 0),
    );
    expect(getMascotFrameDuration("walk", 17)).toBe(125);
  });
});
