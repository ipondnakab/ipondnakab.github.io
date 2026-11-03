import { describe, expect, it } from "vitest";

import {
  chooseMascotAmbientAction,
  getMascotAmbientDelay,
  getMascotGroomDelay,
  resolveMascotAction,
} from "@/features/chat/lib/ambient-action";

describe("mascot idle activities", () => {
  it("chooses every playful activity and avoids consecutive repeats", () => {
    const choices = [0, 0.26, 0.51, 0.99].map((value) =>
      chooseMascotAmbientAction(value, null),
    );
    expect(new Set(choices)).toEqual(
      new Set(["roll", "groom", "stretch", "expression"]),
    );
    for (const previous of choices) {
      for (const random of [0, 0.5, 1])
        expect(chooseMascotAmbientAction(random, previous)).not.toBe(previous);
    }
  });

  it("waits between eight and sixteen seconds and handles boundary random values", () => {
    expect(getMascotAmbientDelay(0)).toBe(8000);
    expect(getMascotAmbientDelay(1)).toBe(16000);
    expect(getMascotAmbientDelay(-1)).toBe(8000);
    expect(getMascotAmbientDelay(2)).toBe(16000);
  });

  it("randomizes seated pauses between grooming bursts", () => {
    expect(getMascotGroomDelay(0)).toBe(1500);
    expect(getMascotGroomDelay(0.5)).toBe(3000);
    expect(getMascotGroomDelay(1)).toBe(4500);
    expect(getMascotGroomDelay(-1)).toBe(1500);
    expect(getMascotGroomDelay(Number.NaN)).toBe(1500);
  });

  it("gives walking and chat reactions priority over ambient actions", () => {
    expect(resolveMascotAction("idle", "roll", false)).toBe("roll");
    expect(resolveMascotAction("idle", null, false)).toBe("sit");
    expect(resolveMascotAction("walking", "roll", false)).toBe("walk");
    expect(resolveMascotAction("thinking", "roll", false)).toBe("groom");
    expect(resolveMascotAction("replying", "roll", false)).toBe("expression");
    expect(resolveMascotAction("walking", "roll", true)).toBe("sit");
  });
});
