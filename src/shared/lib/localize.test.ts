import { describe, expect, it } from "vitest";

import { localize, localizeText } from "@/shared/lib/localize";
import { LocalizedText } from "@/shared/types/localized-text";

const text = { en: "Hello", th: "สวัสดี" } as LocalizedText;

describe("localize", () => {
  it("resolves the active language", () => {
    expect(localize(text, "th")).toBe("สวัสดี");
  });

  it("strips a region subtag before looking the language up", () => {
    expect(localize(text, "th-TH")).toBe("สวัสดี");
  });

  it("falls back to English for a language with no translation", () => {
    expect(localize(text, "ja")).toBe("Hello");
  });
});

describe("localizeText", () => {
  it("preserves a single entry's shape", () => {
    expect(localizeText(text, "th")).toBe("สวัสดี");
  });

  it("preserves a list's shape and order", () => {
    const list = [text, { en: "Bye", th: "ลาก่อน" } as LocalizedText];
    expect(localizeText(list, "th")).toEqual(["สวัสดี", "ลาก่อน"]);
  });
});
