import Deepjump from "@/features/deepjump/components/Deepjump";
import { HISTORY_KEY } from "@/features/deepjump/constants";
import en from "@/shared/i18n/locales/en.json";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const i18n = i18next.createInstance();
beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "en",
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});
const mount = (navigate = vi.fn()) => {
  const view = render(
    <I18nextProvider i18n={i18n}>
      <Deepjump navigate={navigate} />
    </I18nextProvider>,
  );
  return { ...view, navigate };
};
const clickHistoryDelete = (url: string) => {
  const row = screen.getByText(url).closest("li");
  const trashIcon = row?.querySelector("svg");
  if (!trashIcon) throw new Error(`Missing history delete icon for ${url}`);
  fireEvent.click(trashIcon);
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("Deepjump launcher", () => {
  it("persists before synchronously navigating on tap and Enter", () => {
    const navigate = vi.fn((url: string) => {
      expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)[0].url).toBe(url);
    });
    mount(navigate);
    fireEvent.change(screen.getByLabelText("Deeplink"), {
      target: { value: "  myapp://test?a=%20  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Jump" }));
    expect(navigate).toHaveBeenCalledWith("myapp://test?a=%20");
    fireEvent.keyDown(screen.getByLabelText("Deeplink"), { key: "Enter" });
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toHaveLength(1);
  });
  it("shows validation and never navigates for executable links", async () => {
    const { navigate } = mount();
    fireEvent.change(screen.getByLabelText("Deeplink"), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Jump" }));
    await waitFor(() =>
      expect(screen.getByText(en.deepjump.invalid)).toBeTruthy(),
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  });
  it("restores history, jumps by tapping its URL, and confirms icon deletion and clearing", async () => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        { url: "app://a", jumpedAt: 2 },
        { url: "app://b", jumpedAt: 1 },
      ]),
    );
    const first = mount();
    first.unmount();
    const { navigate } = mount();
    fireEvent.click(screen.getByText("app://b"));
    expect(navigate).toHaveBeenCalledWith("app://b");
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)[0].url).toBe(
      "app://b",
    );
    clickHistoryDelete("app://b");
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toHaveLength(2);
    const deleteDialog = await screen.findByRole("dialog");
    expect(within(deleteDialog).getByText("app://b")).toBeTruthy();
    fireEvent.click(
      within(deleteDialog).getByRole("button", { name: "Delete" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Clear history" }));
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toHaveLength(1);
    const clearDialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(clearDialog).getByRole("button", { name: "Clear history" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toEqual([]);
  });
  it("keeps history when deletion or clearing is cancelled", async () => {
    const stored = JSON.stringify([{ url: "app://keep", jumpedAt: 1 }]);
    localStorage.setItem(HISTORY_KEY, stored);
    mount();
    const actions = [
      () => clickHistoryDelete("app://keep"),
      () =>
        fireEvent.click(screen.getByRole("button", { name: "Clear history" })),
    ];
    for (const openConfirmation of actions) {
      openConfirmation();
      const dialog = await screen.findByRole("dialog");
      fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(localStorage.getItem(HISTORY_KEY)).toBe(stored);
      expect(screen.getByText("app://keep")).toBeTruthy();
    }
  });
  it("still jumps when storage is blocked and reports the error", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { navigate } = mount();
    fireEvent.change(screen.getByLabelText("Deeplink"), {
      target: { value: "app://a" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Jump" }));
    expect(navigate).toHaveBeenCalledWith("app://a");
    expect(screen.getByRole("status").textContent).toBe(
      en.deepjump.storageError,
    );
  });
});
