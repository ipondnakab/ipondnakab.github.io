import { describe, expect, it } from "vitest";

import { getEvasivePosition } from "@/features/drunkard-game/lib/get-evasive-position";

describe("getEvasivePosition", () => {
  it("chooses the available corner farthest from the pointer", () => {
    expect(
      getEvasivePosition({
        pointer: { x: 290, y: 70 },
        container: { width: 320, height: 140 },
        button: { width: 120, height: 50 },
        padding: 8,
      }),
    ).toEqual({ x: 8, y: 8 });
  });

  it("keeps the button inside a small container", () => {
    const position = getEvasivePosition({
      pointer: { x: 0, y: 0 },
      container: { width: 100, height: 40 },
      button: { width: 120, height: 50 },
      padding: 8,
    });

    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });
});
