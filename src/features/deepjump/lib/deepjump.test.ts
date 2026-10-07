import {
  addToHistory,
  parseHistory,
  validateDeeplink,
} from "@/features/deepjump/lib/deepjump";
import { describe, expect, it } from "vitest";

describe("deeplink validation", () => {
  it("preserves custom schemes, web URLs and Android intent extras", () => {
    for (const url of [
      "myapp://path?a=%20#test",
      "https://example.com",
      "intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end",
    ]) {
      expect(validateDeeplink(` ${url} `)).toBe(url);
    }
  });
  it("rejects relative, malformed and executable or local schemes", () => {
    for (const url of [
      "",
      "example.com",
      "/path",
      "https://",
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "data:text/html,hi",
      "file:///etc/passwd",
      "about:blank",
      "blob:https://example.com/a",
      "myapp://a\nb",
      "intent://a",
      "intent://a/#Intent;scheme=javascript;end",
    ]) {
      expect(validateDeeplink(url)).toBeNull();
    }
  });
});
describe("jump history", () => {
  it("moves repeat attempts to the front and caps history", () => {
    const history = Array.from({ length: 50 }, (_, i) => ({
      url: `app://item/${i}`,
      jumpedAt: i,
    }));
    expect(addToHistory(history, "app://item/20", 100)[0]).toEqual({
      url: "app://item/20",
      jumpedAt: 100,
    });
    expect(addToHistory(history, "app://new", 100)).toHaveLength(50);
    expect(addToHistory(history, "app://item/20", 100)).toHaveLength(50);
  });
  it("restores only valid entries and ignores corrupt data", () => {
    expect(parseHistory("bad json")).toEqual([]);
    expect(parseHistory("{}")).toEqual([]);
    expect(parseHistory(null)).toEqual([]);
    expect(
      parseHistory(
        JSON.stringify([
          { url: "app://a", jumpedAt: 2 },
          { url: "javascript:alert(1)", jumpedAt: 3 },
          { url: "app://b", jumpedAt: "bad" },
          { url: "app://a", jumpedAt: 1 },
        ]),
      ),
    ).toEqual([{ url: "app://a", jumpedAt: 2 }]);
  });
});
