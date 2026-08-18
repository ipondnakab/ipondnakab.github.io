import { describe, expect, it } from "vitest";

import {
  CREDITED_PROJECT_COUNT,
  CREDIT_CATEGORIES,
} from "@/features/credit/constants";
import en from "@/shared/i18n/locales/en.json";

const allProjects = CREDIT_CATEGORIES.flatMap((c) => c.projects);

describe("CREDIT_CATEGORIES", () => {
  it("has a unique id per category", () => {
    const ids = CREDIT_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a translated heading for every category", () => {
    const headings = (en.credit as { category: Record<string, string> })
      .category;
    for (const category of CREDIT_CATEGORIES) {
      expect(
        headings[category.id],
        `missing credit.category.${category.id}`,
      ).toBeTruthy();
    }
  });

  it("lists no project twice", () => {
    const names = allProjects.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every project a name, description and licence", () => {
    for (const p of allProjects) {
      expect(p.name.trim(), "name").not.toBe("");
      expect(p.description.trim(), `${p.name} description`).not.toBe("");
      expect(p.license.trim(), `${p.name} licence`).not.toBe("");
    }
  });

  it("links every project over https", () => {
    for (const p of allProjects) {
      expect(() => new URL(p.url), `${p.name} url`).not.toThrow();
      expect(new URL(p.url).protocol, `${p.name} url`).toBe("https:");
    }
  });

  // GSAP ships under its own no-charge licence, not an OSI one. If a dependency
  // bump ever changes that, this page must not keep implying otherwise.
  it("does not label a non-OSI licence as MIT", () => {
    const gsap = allProjects.find((p) => p.name === "GSAP");
    expect(gsap).toBeDefined();
    expect(gsap?.license).not.toBe("MIT");
  });

  it("keeps CREDITED_PROJECT_COUNT in step with the list", () => {
    expect(CREDITED_PROJECT_COUNT).toBe(allProjects.length);
    expect(CREDITED_PROJECT_COUNT).toBeGreaterThan(0);
  });
});
