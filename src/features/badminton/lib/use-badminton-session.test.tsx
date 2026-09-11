import {
  BADMINTON_STORAGE_KEY,
  DEFAULT_BADMINTON_SESSION,
} from "@/features/badminton/constants";
import { useBadmintonSession } from "@/features/badminton/lib/use-badminton-session";
import { act, cleanup, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("saved badminton session lifecycle", () => {
  it("restores before saving, including in Strict Mode, then persists changes", () => {
    const stored = {
      ...DEFAULT_BADMINTON_SESSION,
      players: [{ id: "saved", name: "Saved player", gender: "female" }],
      view: "play",
    };
    localStorage.setItem(BADMINTON_STORAGE_KEY, JSON.stringify(stored));
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useBadmintonSession(), {
      wrapper: ({ children }) => (
        <React.StrictMode>{children}</React.StrictMode>
      ),
    });
    expect(result.current.session).toEqual(stored);
    expect(
      write.mock.calls.every(
        ([, json]) => JSON.parse(json).players.length === 1,
      ),
    ).toBe(true);
    act(() =>
      result.current.setSession((current) => ({ ...current, players: [] })),
    );
    expect(
      JSON.parse(localStorage.getItem(BADMINTON_STORAGE_KEY)!).players,
    ).toEqual([]);
  });
  it("does not overwrite unreadable saved data during startup", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("read blocked");
    });
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useBadmintonSession());
    expect(write).not.toHaveBeenCalled();
    expect(result.current.storageUnavailable).toBe(true);
  });
  it("allows in-memory edits when saving is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { result } = renderHook(() => useBadmintonSession());
    act(() =>
      result.current.setSession((current) => ({ ...current, view: "history" })),
    );
    expect(result.current.session.view).toBe("history");
    expect(result.current.storageUnavailable).toBe(true);
  });
});
