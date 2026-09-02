import { describe, expect, it } from "vitest";

import { isAndroidUserAgent } from "@/features/drunkard-game/lib/is-android-user-agent";

describe("isAndroidUserAgent", () => {
  it("detects Android phones and tablets", () => {
    expect(
      isAndroidUserAgent(
        "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",
      ),
    ).toBe(true);
    expect(
      isAndroidUserAgent(
        "Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 Chrome/140 Safari/537.36",
      ),
    ).toBe(true);
  });

  it("does not match iOS or desktop browsers", () => {
    expect(
      isAndroidUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      ),
    ).toBe(false);
    expect(
      isAndroidUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"),
    ).toBe(false);
  });
});
