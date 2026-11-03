import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ChatMascot from "@/features/chat/components/ChatMascot";
import {
  MASCOT_ACTIONS,
  MASCOT_SPRITE_HEIGHT,
  MASCOT_SPRITE_SRC,
  MASCOT_SPRITE_WIDTH,
} from "@/features/chat/constants";
import {
  getMascotFrameDuration,
  getMascotSpriteFrame,
} from "@/features/chat/lib/sprite-frame";
import type {
  MascotAction,
  MascotAmbientAction,
  MascotState,
} from "@/features/chat/model/mascot";

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
      naturalWidth = MASCOT_SPRITE_WIDTH;
      naturalHeight = MASCOT_SPRITE_HEIGHT;
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
const clipDuration = (action: MascotAction) =>
  MASCOT_ACTIONS[action].frames.reduce(
    (total, _, tick) => total + getMascotFrameDuration(action, tick),
    0,
  );

const sourceRectangle = (
  state: MascotState,
  tick = 0,
  ambient: MascotAmbientAction | null = null,
) => {
  const { source } = getMascotSpriteFrame(state, tick, false, ambient);
  return [source.x, source.y, source.width, source.height];
};
const expectFrame = (
  state: MascotState,
  tick = 0,
  ambient: MascotAmbientAction | null = null,
) => {
  expect(harness.drawImage.mock.calls.at(-1)?.slice(1, 5)).toEqual(
    sourceRectangle(state, tick, ambient),
  );
};

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
    act(() => vi.advanceTimersByTime(60000));
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

  it("plays one random action, returns to sitting, then chooses a different action", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<ChatMascot state="idle" />);
    loaded();
    const seated = harness.drawImage.mock.calls.at(-1);
    act(() => vi.advanceTimersByTime(8000));
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(seated);
    act(() => vi.advanceTimersByTime(getMascotFrameDuration("roll", 0)));
    expect(harness.drawImage.mock.calls.at(-1)).not.toEqual(seated);
    act(() =>
      vi.advanceTimersByTime(
        clipDuration("roll") - getMascotFrameDuration("roll", 0),
      ),
    );
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(seated);
    act(() => vi.advanceTimersByTime(8000));
    expectFrame("idle", 0, "groom");
  });

  it("interrupts a playful action immediately for walking and chat activity", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { rerender } = render(<ChatMascot state="idle" />);
    loaded();
    act(() => vi.advanceTimersByTime(8000));
    rerender(<ChatMascot state="walking" facing="right" />);
    expectFrame("walking");
    act(() => vi.advanceTimersByTime(2000));
    expectFrame("walking");
    rerender(<ChatMascot state="thinking" />);
    expectFrame("thinking");
  });

  it("does not queue random actions while hidden and starts a fresh idle wait on return", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<ChatMascot state="idle" />);
    loaded();
    act(() => vi.advanceTimersByTime(4000));
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(20000));
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(7999));
    expect(
      MASCOT_ACTIONS.sit.frames.map((_, tick) => sourceRectangle("idle", tick)),
    ).toContainEqual(harness.drawImage.mock.calls.at(-1)?.slice(1, 5));
    act(() => vi.advanceTimersByTime(1));
    expectFrame("idle", 0, "roll");
  });

  it("cancels the pending idle activity timer when unmounted", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const scheduled = vi.spyOn(window, "setTimeout");
    const cleared = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(<ChatMascot state="idle" />);
    loaded();
    const index = scheduled.mock.calls.findIndex(([, delay]) => delay === 8000);
    expect(index).toBeGreaterThanOrEqual(0);
    const timer = scheduled.mock.results[index]?.value;
    unmount();
    expect(cleared).toHaveBeenCalledWith(timer);
  });

  it("pauses a playful clip while hidden and finishes it after returning", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<ChatMascot state="idle" />);
    loaded();
    act(() => vi.advanceTimersByTime(8000 + getMascotFrameDuration("roll", 0)));
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    const count = harness.drawImage.mock.calls.length;
    act(() => vi.advanceTimersByTime(20000));
    expect(harness.drawImage).toHaveBeenCalledTimes(count);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(clipDuration("roll")));
    expectFrame("idle");
  });

  it("grooms once then waits a variable seated interval before another burst", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    render(<ChatMascot state="thinking" />);
    loaded();
    expectFrame("thinking");
    act(() => vi.advanceTimersByTime(clipDuration("groom")));
    expectFrame("idle");
    const seated = MASCOT_ACTIONS.sit.frames.map((_, tick) =>
      sourceRectangle("idle", tick),
    );
    act(() => vi.advanceTimersByTime(1499));
    expect(seated).toContainEqual(
      harness.drawImage.mock.calls.at(-1)?.slice(1, 5),
    );
    act(() => vi.advanceTimersByTime(1));
    expectFrame("thinking");
    random.mockReturnValue(1);
    act(() => vi.advanceTimersByTime(clipDuration("groom")));
    expectFrame("idle");
    act(() => vi.advanceTimersByTime(4499));
    expect(seated).toContainEqual(
      harness.drawImage.mock.calls.at(-1)?.slice(1, 5),
    );
    act(() => vi.advanceTimersByTime(1));
    expectFrame("thinking");
  });

  it("cancels the next grooming burst when a reply arrives", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { rerender } = render(<ChatMascot state="thinking" />);
    loaded();
    act(() => vi.advanceTimersByTime(clipDuration("groom")));
    rerender(<ChatMascot state="replying" />);
    harness.drawImage.mockClear();
    act(() => vi.advanceTimersByTime(6000));
    const expressions = MASCOT_ACTIONS.expression.frames.map((_, tick) =>
      sourceRectangle("replying", tick),
    );
    for (const call of harness.drawImage.mock.calls)
      expect(expressions).toContainEqual(call.slice(1, 5));
  });

  it("starts a fresh grooming wait after visibility returns and cleans it up", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { unmount } = render(<ChatMascot state="thinking" />);
    loaded();
    act(() => vi.advanceTimersByTime(clipDuration("groom") + 700));
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    const count = harness.drawImage.mock.calls.length;
    act(() => vi.advanceTimersByTime(10000));
    expect(harness.drawImage).toHaveBeenCalledTimes(count);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(1499));
    const seated = MASCOT_ACTIONS.sit.frames.map((_, tick) =>
      sourceRectangle("idle", tick),
    );
    expect(seated).toContainEqual(
      harness.drawImage.mock.calls.at(-1)?.slice(1, 5),
    );
    act(() => vi.advanceTimersByTime(1));
    expectFrame("thinking");
    act(() => vi.advanceTimersByTime(clipDuration("groom")));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("plays event clips once, restarts repeated triggers and resumes the chat state", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { rerender } = render(<ChatMascot state="thinking" />);
    loaded();
    rerender(
      <ChatMascot
        state="thinking"
        actionEvent={{ id: 1, action: "stretch" }}
      />,
    );
    expectFrame("idle", 0, "stretch");
    act(() => vi.advanceTimersByTime(MASCOT_ACTIONS.stretch.frameMs));
    expectFrame("idle", 1, "stretch");
    rerender(
      <ChatMascot
        state="thinking"
        actionEvent={{ id: 2, action: "stretch" }}
      />,
    );
    expectFrame("idle", 0, "stretch");
    act(() =>
      vi.advanceTimersByTime(
        MASCOT_ACTIONS.stretch.frames.length * MASCOT_ACTIONS.stretch.frameMs,
      ),
    );
    expectFrame("idle");
    act(() => vi.advanceTimersByTime(1500));
    expectFrame("thinking");
  });

  it("interrupts event actions for walking and a new reply without replaying old events", () => {
    const event = { id: 1, action: "roll" as const };
    const { rerender } = render(
      <ChatMascot state="idle" actionEvent={event} />,
    );
    loaded();
    act(() => vi.advanceTimersByTime(getMascotFrameDuration("roll", 0)));
    expectFrame("idle", 1, "roll");
    rerender(<ChatMascot state="replying" actionEvent={event} />);
    expectFrame("replying");
    rerender(
      <ChatMascot state="walking" actionEvent={{ id: 2, action: "stretch" }} />,
    );
    expectFrame("walking");
    rerender(
      <ChatMascot state="idle" actionEvent={{ id: 2, action: "stretch" }} />,
    );
    expectFrame("idle");
  });

  it("loops for the entire hover, resumes after stretch, and stops on pointer leave", () => {
    const { rerender } = render(<ChatMascot state="thinking" isHovered />);
    loaded();
    act(() =>
      vi.advanceTimersByTime(
        getMascotFrameDuration("roll", 0) + getMascotFrameDuration("roll", 1),
      ),
    );
    harness.drawImage.mockClear();
    const groundDuration = [2, 3, 4, 5].reduce(
      (sum, tick) => sum + getMascotFrameDuration("roll", tick),
      0,
    );
    act(() => vi.advanceTimersByTime(groundDuration * 8));
    const groundPoses = [2, 3, 4, 5].map((tick) =>
      sourceRectangle("idle", tick, "roll"),
    );
    for (const call of harness.drawImage.mock.calls) {
      expect(groundPoses).toContainEqual(call.slice(1, 5));
    }
    expect(harness.drawImage.mock.calls.length).toBeGreaterThan(0);
    const event = { id: 1, action: "stretch" as const };
    rerender(<ChatMascot state="thinking" isHovered actionEvent={event} />);
    expectFrame("idle", 0, "stretch");
    act(() =>
      vi.advanceTimersByTime(
        MASCOT_ACTIONS.stretch.frames.length * MASCOT_ACTIONS.stretch.frameMs,
      ),
    );
    expectFrame("idle", 0, "roll");
    act(() => vi.advanceTimersByTime(getMascotFrameDuration("roll", 0)));
    const rolling = harness.drawImage.mock.calls.at(-1);
    rerender(<ChatMascot state="thinking" actionEvent={event} />);
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(rolling);
    act(() => vi.advanceTimersByTime(getMascotFrameDuration("roll", 1)));
    const continuing = harness.drawImage.mock.calls.at(-1);
    rerender(<ChatMascot state="thinking" isHovered actionEvent={event} />);
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(continuing);
    rerender(<ChatMascot state="thinking" actionEvent={event} />);
    act(() =>
      vi.advanceTimersByTime(
        clipDuration("roll") -
          getMascotFrameDuration("roll", 0) -
          getMascotFrameDuration("roll", 1),
      ),
    );
    expectFrame("thinking");
    act(() => vi.advanceTimersByTime(MASCOT_ACTIONS.groom.frameMs));
    expectFrame("thinking", 1);
  });

  it("rests on the ground between hover rolls and resumes without sitting up", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<ChatMascot state="idle" isHovered />);
    loaded();
    act(() => vi.advanceTimersByTime(480));
    expectFrame("idle", 2, "roll");
    const resting = harness.drawImage.mock.calls.length;
    act(() => vi.advanceTimersByTime(1199));
    expect(harness.drawImage).toHaveBeenCalledTimes(resting);
    act(() => vi.advanceTimersByTime(1));
    expectFrame("idle", 3, "roll");
    act(() => vi.advanceTimersByTime(740));
    expectFrame("idle", 2, "roll");
    const restingAgain = harness.drawImage.mock.calls.length;
    act(() => vi.advanceTimersByTime(1199));
    expect(harness.drawImage).toHaveBeenCalledTimes(restingAgain);
  });

  it("releases a ground pause on leave and cleans up the remaining wait", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { rerender, unmount } = render(<ChatMascot state="idle" isHovered />);
    loaded();
    act(() => vi.advanceTimersByTime(1220));
    expectFrame("idle", 5, "roll");
    const resting = harness.drawImage.mock.calls.at(-1);
    rerender(<ChatMascot state="idle" />);
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(resting);
    act(() => vi.advanceTimersByTime(getMascotFrameDuration("roll", 5)));
    expectFrame("idle", 6, "roll");
    act(() => vi.advanceTimersByTime(clipDuration("roll")));
    expectFrame("idle");
    unmount();
    const count = harness.drawImage.mock.calls.length;
    act(() => vi.advanceTimersByTime(10000));
    expect(harness.drawImage).toHaveBeenCalledTimes(count);
  });

  it("pauses a ground rest while hidden and cancels it when unmounted", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { unmount } = render(<ChatMascot state="idle" isHovered />);
    loaded();
    act(() => vi.advanceTimersByTime(480));
    const resting = harness.drawImage.mock.calls.length;
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(10000));
    expect(harness.drawImage).toHaveBeenCalledTimes(resting);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(1199));
    expect(harness.drawImage).toHaveBeenCalledTimes(resting);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(10000));
    expect(harness.drawImage).toHaveBeenCalledTimes(resting);
  });

  it("does not rewind a stretch or start another roll after leaving during it", () => {
    const { rerender } = render(<ChatMascot state="idle" isHovered />);
    loaded();
    const event = { id: 1, action: "stretch" as const };
    rerender(<ChatMascot state="idle" isHovered actionEvent={event} />);
    act(() => vi.advanceTimersByTime(MASCOT_ACTIONS.stretch.frameMs));
    expectFrame("idle", 1, "stretch");
    const current = harness.drawImage.mock.calls.at(-1);
    rerender(<ChatMascot state="idle" actionEvent={event} />);
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(current);
    act(() =>
      vi.advanceTimersByTime(
        clipDuration("stretch") - MASCOT_ACTIONS.stretch.frameMs,
      ),
    );
    expectFrame("idle");
  });

  it("prioritizes travel/reduced motion and pauses a hover loop while hidden", () => {
    const { rerender } = render(<ChatMascot state="walking" isHovered />);
    loaded();
    expectFrame("walking");
    rerender(<ChatMascot state="idle" isHovered />);
    expectFrame("idle", 0, "roll");
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    const count = harness.drawImage.mock.calls.length;
    act(() => vi.advanceTimersByTime(20000));
    expect(harness.drawImage).toHaveBeenCalledTimes(count);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(getMascotFrameDuration("roll", 0)));
    expectFrame("idle", 1, "roll");
    harness.reduced = true;
    rerender(<ChatMascot state="idle" isHovered />);
    const still = harness.drawImage.mock.calls.at(-1);
    act(() => vi.advanceTimersByTime(20000));
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(still);
  });

  it("keeps interaction events still with reduced motion", () => {
    harness.reduced = true;
    render(<ChatMascot state="idle" actionEvent={{ id: 1, action: "roll" }} />);
    loaded();
    const first = harness.drawImage.mock.calls.at(-1);
    act(() => vi.advanceTimersByTime(5000));
    expect(harness.drawImage.mock.calls.at(-1)).toEqual(first);
  });

  it("releases the animation timer and pending image handlers on unmount", () => {
    const clear = vi.spyOn(window, "clearTimeout");
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
