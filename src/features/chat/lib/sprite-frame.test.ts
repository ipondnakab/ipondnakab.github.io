import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  MASCOT_SPRITE_HEIGHT,
  MASCOT_SPRITE_SRC,
  MASCOT_SPRITE_WIDTH,
} from "@/features/chat/constants";
import { getMascotSpriteFrame } from "@/features/chat/lib/sprite-frame";

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
        expect(destination.width / source.width).toBeCloseTo(0.35);
        expect(destination.height / source.height).toBeCloseTo(0.35);
        expect(destination.y + (baseline - source.y) * 0.35).toBeCloseTo(108);
      }
    }
  });

  it("keeps walking and idle at the same visible size", () => {
    const idle = getMascotSpriteFrame("idle", 0, false).destination;
    const idleHeight = idle.height;
    for (const state of ["walking", "thinking", "replying"] as const) {
      for (let tick = 0; tick < 16; tick++) {
        const height = getMascotSpriteFrame(state, tick, false).destination
          .height;
        expect(height / idleHeight).toBeGreaterThanOrEqual(0.95);
        expect(height / idleHeight).toBeLessThanOrEqual(1.05);
        const width = getMascotSpriteFrame(state, tick, false).destination
          .width;
        expect(width / idle.width).toBeGreaterThanOrEqual(0.9);
        expect(width / idle.width).toBeLessThanOrEqual(1.1);
      }
    }
  });

  it("uses grooming poses when thinking and one still pose for reduced motion", () => {
    expect(getMascotSpriteFrame("thinking", 0, false).source.y).toBeGreaterThan(
      900,
    );
    const still = getMascotSpriteFrame("idle", 0, true);
    for (const state of ["idle", "walking", "thinking", "replying"] as const) {
      expect(getMascotSpriteFrame(state, 17, true)).toEqual(still);
    }
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
