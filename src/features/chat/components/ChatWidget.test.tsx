import { NextUIProvider } from "@nextui-org/react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import i18next from "i18next";
import { useEffect } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ChatMascotProps } from "./ChatMascot";

import ChatWidget from "@/features/chat/components/ChatWidget";
import {
  MASCOT_REPLY_DURATION_MS,
  MASCOT_TRAVEL_DURATION_MS,
} from "@/features/chat/constants";
import en from "@/shared/i18n/locales/en.json";

const motionPreference = vi.hoisted(() => ({
  reduced: false,
  autoReady: true,
  reportReady: undefined as (() => void) | undefined,
}));
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => motionPreference.reduced,
}));
vi.mock("next/dynamic", () => ({
  default:
    () =>
    ({ state, facing, onReady, actionEvent, isHovered }: ChatMascotProps) => {
      useEffect(() => {
        motionPreference.reportReady = onReady;
        if (motionPreference.autoReady) onReady?.();
      }, [onReady]);
      return (
        <div
          data-testid="walking-cat"
          data-state={state}
          data-facing={facing}
          data-hovered={isHovered}
          data-action={actionEvent?.action}
          data-action-id={actionEvent?.id}
        />
      );
    },
}));
vi.mock("@/shared/config/environment", () => ({
  environment: { chatApiUrl: "https://api.example.test/api/chat" },
}));
vi.mock("@/shared/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/features/chat/lib/chat-history", () => ({
  saveChatTranscript: vi.fn(),
}));

const i18n = i18next.createInstance();
beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "en",
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});
beforeEach(() => {
  sessionStorage.clear();
  motionPreference.reduced = false;
  motionPreference.autoReady = true;
  motionPreference.reportReady = undefined;
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const mountWidget = () =>
  render(
    <NextUIProvider disableAnimation>
      <I18nextProvider i18n={i18n}>
        <ChatWidget />
      </I18nextProvider>
    </NextUIProvider>,
  );
const openChat = () => {
  mountWidget();
  act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS));
  fireEvent.click(screen.getByRole("button", { name: en.chat.open }));
};
const send = () => {
  fireEvent.change(screen.getByLabelText(en.chat.inputLabel), {
    target: { value: "Tell me about Kittipat" },
  });
  fireEvent.click(screen.getByRole("button", { name: en.chat.send }));
};

describe("chat companion response states", () => {
  it("thinks during a request, celebrates the reply, then returns to idle", async () => {
    let finish: (response: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    const fetch = vi.fn(() => pending);
    vi.stubGlobal("fetch", fetch);
    openChat();
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-state",
      "idle",
    );
    send();
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-state",
      "thinking",
    );
    await act(async () => {
      finish(
        new Response(JSON.stringify({ reply: "He builds helpful tools." })),
      );
    });
    expect(screen.getByText("He builds helpful tools.")).toBeInTheDocument();
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-state",
      "replying",
    );
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
    act(() => vi.advanceTimersByTime(MASCOT_REPLY_DURATION_MS));
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-state",
      "idle",
    );
  });

  it("returns to idle with the existing error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    openChat();
    await act(async () => send());
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-state",
      "idle",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(en.chat.errors.offline);
    expect(screen.getByTestId("walking-cat")).not.toHaveAttribute(
      "data-state",
      "replying",
    );
  });
});

describe("one cat on page load", () => {
  it("walks in automatically and becomes the single chat button", () => {
    mountWidget();
    expect(screen.getAllByTestId("walking-cat")).toHaveLength(1);
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "entering",
    );
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-state",
      "walking",
    );
    const button = screen.getByRole("button", { name: en.chat.open });
    expect(button).toBeDisabled();
    expect(button).toContainElement(screen.getByTestId("walking-cat"));
    expect(screen.queryByLabelText(en.chat.inputLabel)).toBeNull();
    act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS));
    expect(button).toBeEnabled();
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "active",
    );
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-state",
      "idle",
    );
  });

  it("keeps the same one cat when opening, closing and reopening chat", () => {
    openChat();
    const cat = screen.getByTestId("walking-cat");
    expect(screen.getAllByTestId("walking-cat")).toHaveLength(1);
    const avatar = document.querySelector("img");
    expect(avatar).toHaveAttribute("src", "/images/khunkao-avatar.png");
    expect(avatar).toHaveAttribute("alt", "");
    fireEvent.click(screen.getAllByRole("button", { name: en.chat.close })[0]);
    expect(screen.queryByLabelText(en.chat.inputLabel)).toBeNull();
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByTestId("walking-cat")).toBe(cat);
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "active",
    );
    expect(sessionStorage.getItem("chat.dismissed")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: en.chat.open }));
    const controls = screen.getAllByRole("button", { name: en.chat.close });
    fireEvent.click(controls[controls.length - 1]);
    expect(screen.getByTestId("walking-cat")).toBe(cat);
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "active",
    );
  });

  it("only walks out on dismissal, then remains hidden in the session", () => {
    openChat();
    fireEvent.click(screen.getByRole("button", { name: en.chat.hide }));
    expect(sessionStorage.getItem("chat.dismissed")).toBe("1");
    expect(screen.queryByLabelText(en.chat.inputLabel)).toBeNull();
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "exiting",
    );
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-state",
      "walking",
    );
    expect(screen.getByTestId("walking-cat")).toHaveAttribute(
      "data-facing",
      "right",
    );
    expect(screen.getByRole("button", { name: en.chat.open })).toBeDisabled();
    act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS - 1));
    expect(screen.getAllByTestId("walking-cat")).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId("walking-cat")).toBeNull();
    expect(screen.queryByRole("button", { name: en.chat.open })).toBeNull();
    cleanup();
    mountWidget();
    expect(screen.queryByTestId("walking-cat")).toBeNull();
  });

  it("waits for scene readiness before starting its automatic entrance", () => {
    motionPreference.autoReady = false;
    mountWidget();
    act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS * 3));
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "loading",
    );
    expect(screen.getByRole("button", { name: en.chat.open })).toBeDisabled();
    act(() => motionPreference.reportReady?.());
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "entering",
    );
    act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS));
    expect(screen.getByRole("button", { name: en.chat.open })).toBeEnabled();
  });

  it("never creates a cat when this session has already dismissed it", () => {
    sessionStorage.setItem("chat.dismissed", "1");
    mountWidget();
    expect(screen.queryByTestId("walking-cat")).toBeNull();
    expect(screen.queryByRole("button", { name: en.chat.open })).toBeNull();
  });

  it("skips entrance and exit travel for reduced motion", () => {
    motionPreference.reduced = true;
    mountWidget();
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "active",
    );
    expect(screen.getByRole("button", { name: en.chat.open })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: en.chat.hide }));
    expect(screen.queryByTestId("walking-cat")).toBeNull();
    expect(sessionStorage.getItem("chat.dismissed")).toBe("1");
  });

  it("still enters and walks out if session storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    mountWidget();
    act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS));
    fireEvent.click(screen.getByRole("button", { name: en.chat.hide }));
    expect(screen.getByTestId("chat-companion")).toHaveAttribute(
      "data-phase",
      "exiting",
    );
    act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS));
    expect(screen.queryByTestId("walking-cat")).toBeNull();
  });
});

describe("mascot interaction events", () => {
  it("rolls on hover/focus and stretches for each open and close control", () => {
    mountWidget();
    act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS));
    const cat = screen.getByTestId("walking-cat");
    let launcher = screen.getByRole("button", { name: en.chat.open });
    fireEvent.mouseEnter(launcher);
    expect(cat).toHaveAttribute("data-hovered", "true");
    fireEvent.mouseLeave(launcher);
    expect(cat).toHaveAttribute("data-hovered", "false");
    const first = cat.getAttribute("data-action-id");
    fireEvent.focus(launcher);
    expect(cat.getAttribute("data-action-id")).not.toBe(first);
    fireEvent.click(launcher);
    expect(cat).toHaveAttribute("data-action", "stretch");
    let closes = screen.getAllByRole("button", { name: en.chat.close });
    const opened = cat.getAttribute("data-action-id");
    fireEvent.click(closes[0]);
    expect(cat).toHaveAttribute("data-action", "stretch");
    expect(cat.getAttribute("data-action-id")).not.toBe(opened);
    launcher = screen.getByRole("button", { name: en.chat.open });
    fireEvent.click(launcher);
    closes = screen.getAllByRole("button", { name: en.chat.close });
    fireEvent.click(closes[closes.length - 1]);
    expect(cat).toHaveAttribute("data-action", "stretch");
    expect(screen.queryByLabelText(en.chat.inputLabel)).toBeNull();
  });

  it("grooms while a draft waits, stops when cleared/closed, and typing interrupts a reply", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ reply: "Hello!" }))),
    );
    openChat();
    const cat = screen.getByTestId("walking-cat");
    const input = screen.getByLabelText(en.chat.inputLabel);
    fireEvent.change(input, { target: { value: "Hello" } });
    expect(cat).toHaveAttribute("data-state", "thinking");
    const launcher = screen
      .getAllByRole("button", { name: en.chat.close })
      .at(-1)!;
    fireEvent.focus(launcher);
    const hovered = Number(cat.getAttribute("data-action-id"));
    expect(cat).toHaveAttribute("data-action", "roll");
    fireEvent.change(input, { target: { value: "Hello again" } });
    expect(cat).not.toHaveAttribute("data-action");
    fireEvent.focus(launcher);
    expect(cat).toHaveAttribute("data-action", "roll");
    expect(Number(cat.getAttribute("data-action-id"))).toBeGreaterThan(hovered);
    fireEvent.change(input, { target: { value: "" } });
    expect(cat).toHaveAttribute("data-state", "idle");
    await act(async () => send());
    expect(cat).toHaveAttribute("data-state", "replying");
    fireEvent.change(input, { target: { value: "Another question" } });
    expect(cat).toHaveAttribute("data-state", "thinking");
    fireEvent.click(screen.getAllByRole("button", { name: en.chat.close })[0]);
    expect(cat).toHaveAttribute("data-state", "idle");
  });
});

describe("chat invitation bubble", () => {
  it("waits for readiness and sitting, then shows for exactly three seconds", () => {
    motionPreference.autoReady = false;
    const { container } = mountWidget();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByTestId("chat-invitation")).toBeNull();
    act(() => motionPreference.reportReady?.());
    act(() => vi.advanceTimersByTime(MASCOT_TRAVEL_DURATION_MS - 1));
    expect(screen.queryByTestId("chat-invitation")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    const bubble = screen.getByTestId("chat-invitation");
    expect(bubble).toHaveTextContent(en.chat.tooltip);
    expect(bubble).toHaveAttribute("role", "status");
    expect(container).toContainElement(bubble);
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(screen.getByRole("button", { name: en.chat.open })).toHaveAttribute(
      "aria-describedby",
      bubble.id,
    );
    fireEvent.mouseLeave(screen.getByRole("button", { name: en.chat.open }));
    act(() => vi.advanceTimersByTime(2999));
    expect(screen.getByTestId("chat-invitation")).toHaveTextContent(
      en.chat.tooltip,
    );
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId("chat-invitation")).toBeNull();
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.queryByTestId("chat-invitation")).toBeNull();
    const launcher = screen.getByRole("button", { name: en.chat.open });
    fireEvent.mouseEnter(launcher);
    expect(screen.getByTestId("chat-invitation")).toHaveTextContent(
      en.chat.tooltip,
    );
    fireEvent.mouseLeave(launcher);
    expect(screen.queryByTestId("chat-invitation")).toBeNull();
    fireEvent.focus(launcher);
    expect(screen.getByTestId("chat-invitation")).toHaveTextContent(
      en.chat.tooltip,
    );
    fireEvent.blur(launcher);
    expect(screen.queryByTestId("chat-invitation")).toBeNull();
  });

  it("cancels the invitation when opening chat and does not replay on close", () => {
    openChat();
    expect(screen.queryByTestId("chat-invitation")).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: en.chat.close })[0]);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByTestId("chat-invitation")).toBeNull();
  });

  it("shows after skipped travel and clears its timer on unmount", () => {
    motionPreference.reduced = true;
    const scheduled = vi.spyOn(window, "setTimeout");
    const cleared = vi.spyOn(window, "clearTimeout");
    const { unmount } = mountWidget();
    expect(screen.getByTestId("chat-invitation")).toHaveTextContent(
      en.chat.tooltip,
    );
    const index = scheduled.mock.calls.findIndex(([, delay]) => delay === 3000);
    expect(index).toBeGreaterThanOrEqual(0);
    const timer = scheduled.mock.results[index]?.value;
    unmount();
    expect(cleared).toHaveBeenCalledWith(timer);
  });
});
