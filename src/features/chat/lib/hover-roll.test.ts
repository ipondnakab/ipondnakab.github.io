import { describe, expect, it } from "vitest";

import { MASCOT_ACTIONS } from "@/features/chat/constants";
import {
  chooseHoverRollRestTick,
  getHoverRollRestDelay,
  getNextHoverRollTick,
} from "@/features/chat/lib/hover-roll";

describe("hover roll phases", () => {
  it("rests only on relaxed grounded side poses", () => {
    expect(chooseHoverRollRestTick(0)).toBe(2);
    expect(chooseHoverRollRestTick(0.99)).toBe(5);
    expect(chooseHoverRollRestTick(1)).toBe(5);
  });

  it("varies ground rests within a bounded delay", () => {
    expect(getHoverRollRestDelay(0)).toBe(1200);
    expect(getHoverRollRestDelay(0.5)).toBe(2200);
    expect(getHoverRollRestDelay(1)).toBe(3200);
    expect(getHoverRollRestDelay(-1)).toBe(1200);
    expect(getHoverRollRestDelay(Number.NaN)).toBe(1200);
  });

  it("enters from sitting and loops only the poses on the ground", () => {
    let tick = 0;
    const poses = [MASCOT_ACTIONS.roll.frames[tick]];
    for (let step = 0; step < 30; step++) {
      tick = getNextHoverRollTick(tick, true);
      poses.push(MASCOT_ACTIONS.roll.frames[tick]);
    }
    expect(poses.slice(0, 3)).toEqual([0, 21, 22]);
    expect(new Set(poses.slice(2))).toEqual(new Set([22, 23, 24, 25]));
  });

  it("resumes the ground loop after re-entering while getting up", () => {
    let tick = 6;
    const poses = [];
    for (let step = 0; step < 30; step++) {
      tick = getNextHoverRollTick(tick, true);
      poses.push(
        MASCOT_ACTIONS.roll.frames[tick % MASCOT_ACTIONS.roll.frames.length],
      );
    }
    expect(new Set(poses.slice(6))).toEqual(new Set([22, 23, 24, 25]));
  });

  it("exits any ground phase through get-up and sitting when hover ends", () => {
    for (const start of [2, 3, 4, 5]) {
      let tick = start;
      const poses = [];
      while (tick < MASCOT_ACTIONS.roll.frames.length) {
        poses.push(MASCOT_ACTIONS.roll.frames[tick]);
        tick = getNextHoverRollTick(tick, false);
      }
      expect(poses.slice(-3)).toEqual([26, 27, 0]);
    }
  });
});
