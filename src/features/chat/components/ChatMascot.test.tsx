import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ChatMascot from "@/features/chat/components/ChatMascot";
import { MASCOT_SPRITE_SRC } from "@/features/chat/constants";

const harness = vi.hoisted(() => ({
  reduced: false,
  contextAvailable: true,
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
}));
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => harness.reduced,
}));

interface TestImage {
  onload: ((event: Event) => unknown) | null;
  onerror: ((event: Event) => unknown) | null;
  src: string;
  complete: boolean;
  naturalWidth: number;
  naturalHeight: number;
}
let images: TestImage[] = [];
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  harness.reduced = false;
  harness.contextAvailable = true;
  images = [];
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() =>
    harness.contextAvailable
      ? (harness as unknown as ReturnType<HTMLCanvasElement["getContext"]>)
      : null,
  );
  vi.stubGlobal(
    "Image",
    class {
      onload: ((event: Event) => unknown) | null = null;
      onerror: ((event: Event) => unknown) | null = null;
      src = "";
      complete = false;
      naturalWidth = 1254;
      naturalHeight = 1254;
      constructor() {
        images.push(this);
      }
    },
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const loaded = () => act(() => images[0].onload?.(new Event("load")));

describe("tabby sprite companion", () => {
  it("starts entrance only after the first sprite is loaded and drawn", () => {
    const onReady = vi.fn();
    const { container } = render(<ChatMascot state="idle" onReady={onReady} />);
    expect(images[0].src).toBe(MASCOT_SPRITE_SRC);
    expect(onReady).not.toHaveBeenCalled();
    loaded();
    expect(harness.drawImage).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalledOnce();
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("canvas")).toHaveAttribute("width", "112");
  });

  it("advances the actual four-legged walking poses", () => {
    render(<ChatMascot state="walking" />);
    loaded();
    const first = harness.drawImage.mock.calls.at(-1);
    act(() => vi.advanceTimersByTime(125));
    expect(harness.drawImage.mock.calls.at(-1)).not.toEqual(first);
    act(() => vi.advanceTimersByTime(875));
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(first);
  });

  it("mirrors the same cat left on entrance and right on departure", () => {
    const { rerender } = render(<ChatMascot state="walking" facing="left" />);
    loaded();
    expect(harness.scale).toHaveBeenLastCalledWith(-1, 1);
    rerender(<ChatMascot state="walking" facing="right" />);
    expect(harness.scale).toHaveBeenLastCalledWith(1, 1);
    expect(images).toHaveLength(1);
  });

  it("keeps one still frame for reduced motion", () => {
    harness.reduced = true;
    render(<ChatMascot state="walking" />);
    loaded();
    const count = harness.drawImage.mock.calls.length;
    act(() => vi.advanceTimersByTime(5000));
    expect(harness.drawImage).toHaveBeenCalledTimes(count);
  });

  it("pauses in background tabs and resumes when visible", () => {
    render(<ChatMascot state="walking" />);
    loaded();
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    const count = harness.drawImage.mock.calls.length;
    act(() => vi.advanceTimersByTime(1000));
    expect(harness.drawImage).toHaveBeenCalledTimes(count);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(125));
    expect(harness.drawImage.mock.calls.length).toBeGreaterThan(count);
  });

  it.each(["load failure", "canvas unavailable"])(
    "keeps the single fallback usable after %s",
    (failure) => {
      const onReady = vi.fn();
      const { container } = render(
        <ChatMascot state="idle" onReady={onReady} />,
      );
      if (failure === "load failure")
        act(() => images[0].onerror?.(new Event("error")));
      else {
        harness.contextAvailable = false;
        loaded();
      }
      expect(onReady).toHaveBeenCalledOnce();
      expect(container.querySelector("svg")).not.toBeNull();
      expect(harness.drawImage).not.toHaveBeenCalled();
    },
  );

  it("releases the animation timer and pending image handlers on unmount", () => {
    const clear = vi.spyOn(window, "clearInterval");
    const { unmount } = render(<ChatMascot state="walking" />);
    loaded();
    const count = harness.drawImage.mock.calls.length;
    unmount();
    expect(clear).toHaveBeenCalled();
    expect(images[0].onload).toBeNull();
    expect(images[0].onerror).toBeNull();
    act(() => vi.advanceTimersByTime(5000));
    expect(harness.drawImage).toHaveBeenCalledTimes(count);
  });
});
