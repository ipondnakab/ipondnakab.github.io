import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import ResumeDownload from "@/features/resume/components/ResumeDownload";
import en from "@/shared/i18n/locales/en.json";
import ja from "@/shared/i18n/locales/ja.json";
import sv from "@/shared/i18n/locales/sv.json";
import th from "@/shared/i18n/locales/th.json";
import zh from "@/shared/i18n/locales/zh.json";
import { trackEvent } from "@/shared/lib/analytics";

vi.mock("@/shared/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: () => en.resume.action.download,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("resume download", () => {
  it("offers a native same-origin download of an existing PDF", () => {
    render(<ResumeDownload />);
    const link = screen.getByRole("link", {
      name: "Download resume (PDF)",
    });
    const href = link.getAttribute("href") ?? "";
    expect(href).toMatch(/^\//);
    const filePath = resolve("public", decodeURIComponent(href.slice(1)));
    expect(existsSync(filePath)).toBe(true);
    expect(readFileSync(filePath).subarray(0, 5).toString()).toBe("%PDF-");
    expect(link.getAttribute("download")).toBe("Kittipat-Daengdee-Resume.pdf");
    expect(link).not.toHaveAttribute("target");
  });

  it("records download intent when activated", () => {
    render(<ResumeDownload />);
    const link = screen.getByRole("link");
    // jsdom cannot perform native downloads; keep this test on click analytics.
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(trackEvent).toHaveBeenCalledWith("resume_download_click", {
      file_name: "Kittipat-Daengdee-Resume.pdf",
    });
  });

  it("provides a PDF download label in every supported language", () => {
    for (const locale of [en, th, ja, sv, zh]) {
      expect(locale.resume.action.download).toMatch(/PDF/);
    }
  });
});
