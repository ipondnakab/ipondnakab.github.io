"use client";

import {
  applyRoomAction,
  createRoom,
  newRoomCode,
  normalizeCode,
  roomExists,
  ScoreRoom,
  subscribeRoom,
  updateRoom,
  winnerOf,
} from "@/features/badminton/lib/realtime-room";
import { connectScorePeers } from "@/features/badminton/lib/webrtc-room";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import Image from "next/image";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

const RealtimeBadmintonRoom = () => {
  const [entry, setEntry] = useState("");
  const [newName, setNewName] = useState("");
  const [code, setCode] = useState("");
  const [room, setRoom] = useState<ScoreRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scoreSize, setScoreSize] = useState(6);
  const [scoreSizeLoaded, setScoreSizeLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("badminton-score-font-size");
      if (saved !== null) {
        const size = Number(saved);
        if (Number.isInteger(size) && size >= 1 && size <= 50) {
          setScoreSize(size);
        }
      }
    } catch {
      // Local storage may be unavailable in restricted browser contexts.
    }
    setScoreSizeLoaded(true);
  }, []);
  useEffect(() => {
    if (!scoreSizeLoaded) return;
    try {
      window.localStorage.setItem(
        "badminton-score-font-size",
        String(scoreSize),
      );
    } catch {
      // The font-size controls still work without persistent storage.
    }
  }, [scoreSize, scoreSizeLoaded]);
  const [mirrored, setMirrored] = useState(false);
  const [teamsFullscreen, setTeamsFullscreen] = useState(false);
  const teamsFullscreenRef = useRef<HTMLDivElement | null>(null);
  const [connection, setConnection] = useState<
    "firebase" | "direct" | "connecting"
  >("firebase");
  const revisionRef = useRef(-1);
  const roomCodeRef = useRef("");
  const roomRef = useRef<ScoreRoom | null>(null);
  const pendingRef = useRef<Parameters<typeof updateRoom>[1][]>([]);
  const busyRef = useRef(false);
  const [syncFailed, setSyncFailed] = useState(false);
  const [syncMode, setSyncMode] = useState<"firebase" | "p2p">("firebase");
  const [syncing, setSyncing] = useState(false);
  const [names, setNames] = useState<[string, string]>(["", ""]);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    const url = new URL(window.location.href);
    const requested = normalizeCode(url.searchParams.get("room") || "");
    if (requested) setCode(requested);
  }, []);
  useEffect(() => {
    if (!code) return;
    roomCodeRef.current = code;
    revisionRef.current = -1;
    const accept = (incoming: ScoreRoom) => {
      if (incoming.revision < revisionRef.current) return;
      revisionRef.current = incoming.revision;
      // Local clicks are never overwritten while their writes are in flight.
      if (pendingRef.current.length) return;
      roomRef.current = incoming;
      setRoom(incoming);
      setNames(incoming.names);
    };
    const peer =
      syncMode === "p2p"
        ? connectScorePeers(code, accept, setConnection)
        : null;
    const unsubscribe = subscribeRoom(
      code,
      (value) => {
        if (!value) {
          setError("Room not found.");
          return;
        }
        accept(value);
        peer?.broadcast(value);
      },
      (cause) => setError(cause.message),
    );
    return () => {
      unsubscribe();
      peer?.();
    };
  }, [code, syncMode]);
  useEffect(() => {
    if (!code) {
      setQrDataUrl("");
      setShareUrl("");
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("room", code);
    setShareUrl(url.toString());
  }, [code]);
  useEffect(() => {
    if (!showQr || !shareUrl) return;
    let active = true;
    void QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setError("Could not generate QR code.");
      });
    return () => {
      active = false;
    };
  }, [showQr, shareUrl]);
  useEffect(() => {
    if (!teamsFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTeamsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [teamsFullscreen]);
  const enter = (next: string) => {
    setError("");
    setRoom(null);
    setTeamsFullscreen(false);
    roomRef.current = null;
    pendingRef.current = [];
    setSyncFailed(false);
    setCode(next);
    const url = new URL(window.location.href);
    url.searchParams.set("room", next);
    window.history.replaceState(null, "", url.toString());
  };
  const create = async () => {
    setLoading(true);
    setError("");
    try {
      const chosen = normalizeCode(newName);
      let next = chosen || newRoomCode();
      if (!chosen) {
        while (await roomExists(next)) next = newRoomCode();
      }
      await createRoom(next);
      enter(next);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create room.",
      );
    } finally {
      setLoading(false);
    }
  };
  const join = async () => {
    const next = normalizeCode(entry);
    if (!next) {
      setError("Enter a room name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!(await roomExists(next))) throw new Error("Room not found.");
      enter(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not join room.");
    } finally {
      setLoading(false);
    }
  };
  const flush = useCallback(async () => {
    if (busyRef.current || !code || !pendingRef.current.length) return;
    busyRef.current = true;
    setSyncing(true);
    setSyncFailed(false);
    try {
      while (pendingRef.current.length && roomCodeRef.current === code) {
        const action = pendingRef.current[0];
        await updateRoom(code, action);
        if (roomCodeRef.current !== code) return;
        pendingRef.current.shift();
      }
    } catch (cause) {
      if (roomCodeRef.current === code) {
        setSyncFailed(true);
        setError(cause instanceof Error ? cause.message : "Score sync failed.");
      }
    } finally {
      busyRef.current = false;
      if (roomCodeRef.current === code)
        setSyncing(pendingRef.current.length > 0);
    }
  }, [code]);
  const change = useCallback(
    (action: Parameters<typeof updateRoom>[1]) => {
      const current = roomRef.current;
      if (!current) return;
      const next = applyRoomAction(current, action);
      if (next === current) return;
      roomRef.current = next;
      setRoom(next);
      pendingRef.current.push(action);
      setError("");
      void flush();
    },
    [flush],
  );
  const enterTeamsFullscreen = async () => {
    const element = teamsFullscreenRef.current;
    if (!element) return;
    if (typeof element.requestFullscreen === "function") {
      try {
        await element.requestFullscreen();
        setTeamsFullscreen(true);
        return;
      } catch {
        // Some mobile browsers do not permit fullscreen on arbitrary elements.
      }
    }
    setTeamsFullscreen(true);
  };
  const exitTeamsFullscreen = async () => {
    if (document.fullscreenElement === teamsFullscreenRef.current) {
      try {
        await document.exitFullscreen();
      } catch {
        // The fallback overlay can still be dismissed.
      }
    }
    setTeamsFullscreen(false);
  };
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement !== teamsFullscreenRef.current) {
        setTeamsFullscreen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTeamsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  const leave = () => {
    if (teamsFullscreen) void exitTeamsFullscreen();
    roomCodeRef.current = "";
    setCode("");
    setRoom(null);
    roomRef.current = null;
    pendingRef.current = [];
    setSyncFailed(false);
    setError("");
    const url = new URL(window.location.href);
    url.searchParams.delete("room");
    window.history.replaceState(null, "", url.toString());
  };
  const wins = room
    ? ([0, 1] as const).map(
        (side) => room.games.filter((game) => winnerOf(game) === side).length,
      )
    : [0, 0];
  const completed = wins.some((count) => count >= 2);
  return (
    <main className="w-full select-none space-y-4 px-2 py-4 sm:px-4 lg:px-6">
      <header className="rounded-2xl bg-content1 p-3">
        <h1 className="text-2xl font-bold">Live Badminton Scoreboard</h1>
        <p className="text-sm text-default-500">
          Create or join a named room to score together in real time.
        </p>
      </header>
      {!code ? (
        <section className="space-y-4 rounded-2xl bg-content1 p-4">
          <Input
            className="select-text"
            label="Room name (optional)"
            placeholder="e.g. friday-badminton"
            value={newName}
            onValueChange={setNewName}
            maxLength={40}
          />
          <Button
            color="primary"
            onPress={create}
            isLoading={loading}
            fullWidth
          >
            Create room
          </Button>
          <div className="flex gap-2">
            <Input
              className="select-text"
              label="Room name"
              placeholder="Enter a room name"
              value={entry}
              onValueChange={(value) => setEntry(normalizeCode(value))}
              maxLength={40}
              aria-label="Room code"
            />
            <Button
              onPress={join}
              isLoading={loading}
              color="primary"
              variant="flat"
            >
              Join
            </Button>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="min-w-0 space-y-3 rounded-2xl bg-content1 p-3 sm:p-4">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 truncate font-mono text-base font-bold sm:text-lg">
                Room: {code}
              </span>
              <Button size="sm" variant="light" onPress={leave}>
                Leave
              </Button>
            </div>
            <div
              className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
              role="group"
              aria-label="Sync transport"
            >
              <Button
                size="sm"
                className="min-w-0 w-full sm:w-auto"
                color={syncMode === "firebase" ? "primary" : "default"}
                variant={syncMode === "firebase" ? "solid" : "flat"}
                onPress={() => setSyncMode("firebase")}
              >
                Firebase Sync
              </Button>
              <Button
                size="sm"
                className="min-w-0 w-full sm:w-auto"
                color={syncMode === "p2p" ? "primary" : "default"}
                variant={syncMode === "p2p" ? "solid" : "flat"}
                onPress={() => setSyncMode("p2p")}
              >
                LAN / P2P
              </Button>
            </div>
            <div className="flex min-h-5 min-w-0 items-center gap-2">
              <span
                role="status"
                aria-live="polite"
                className="min-w-0 text-xs leading-5 text-default-500 sm:text-sm"
              >
                {syncing
                  ? "Saving…"
                  : syncMode === "p2p" && connection === "direct"
                    ? "P2P connected · Firebase persistence"
                    : syncMode === "p2p"
                      ? "Connecting P2P · Firebase persistence"
                      : "Firebase sync"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button
                size="sm"
                className="min-w-0 w-full sm:w-auto"
                variant="flat"
                onPress={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
              >
                Copy link
              </Button>
              <Button
                size="sm"
                className="min-w-0 w-full sm:w-auto"
                variant="flat"
                onPress={() => setShowQr(true)}
              >
                QR code
              </Button>
            </div>
          </div>
          {!room ? (
            <p role="status" className="p-4">
              Connecting to room...
            </p>
          ) : (
            <>
              <div className="min-w-0 space-y-2 rounded-xl bg-content1 p-2 sm:p-3">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {(["standard", "freehand"] as const).map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      className="min-w-0 w-full sm:w-auto"
                      color={room.mode === mode ? "primary" : "default"}
                      variant={room.mode === mode ? "solid" : "flat"}
                      onPress={() => change({ type: "mode", mode })}
                    >
                      {mode === "standard" ? "Standard" : "Freehand"}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button
                    size="sm"
                    className="min-w-0 w-full sm:w-auto"
                    variant="flat"
                    onPress={() => void enterTeamsFullscreen()}
                  >
                    Fullscreen teams
                  </Button>
                  <Button
                    size="sm"
                    className="min-w-0 w-full sm:w-auto"
                    variant={mirrored ? "solid" : "flat"}
                    color={mirrored ? "primary" : "default"}
                    aria-label="Mirror teams on this device"
                    onPress={() => setMirrored((value) => !value)}
                  >
                    ⇄ Mirror
                  </Button>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs tabular-nums text-default-500">
                    Score size: {scoreSize}rem
                  </span>
                  <Button
                    size="sm"
                    isIconOnly
                    aria-label="Smaller score"
                    isDisabled={scoreSize === 1}
                    onPress={() => setScoreSize((n) => Math.max(1, n - 1))}
                  >
                    A−
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    aria-label="Larger score"
                    isDisabled={scoreSize === 50}
                    onPress={() => setScoreSize((n) => Math.min(50, n + 1))}
                  >
                    A+
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setScoreSize(6)}
                    aria-label="Reset score font size"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <div
                ref={teamsFullscreenRef}
                className={
                  teamsFullscreen
                    ? "fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col gap-2 overflow-hidden bg-background p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:p-4"
                    : ""
                }
              >
                {teamsFullscreen && (
                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg bg-content1 p-1.5 sm:p-2">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        isIconOnly
                        aria-label="Decrease fullscreen score font size"
                        isDisabled={scoreSize === 1}
                        onPress={() =>
                          setScoreSize((size) => Math.max(1, size - 1))
                        }
                      >
                        A−
                      </Button>
                      <span className="min-w-10 text-center text-xs tabular-nums sm:text-sm">
                        {scoreSize}rem
                      </span>
                      <Button
                        size="sm"
                        isIconOnly
                        aria-label="Increase fullscreen score font size"
                        isDisabled={scoreSize === 50}
                        onPress={() =>
                          setScoreSize((size) => Math.min(50, size + 1))
                        }
                      >
                        A+
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        aria-label="Reset fullscreen score font size"
                        onPress={() => setScoreSize(6)}
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        aria-label="Reset both teams scores to zero"
                        onPress={() => change({ type: "reset" })}
                      >
                        Reset scores
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        variant="solid"
                        onPress={() => void exitTeamsFullscreen()}
                      aria-label="Exit fullscreen teams"
                    >
                        Exit
                      </Button>
                    </div>
                  </div>
                )}
                <div
                  className={`grid grid-cols-2 gap-1 sm:gap-3 ${teamsFullscreen ? "min-h-0 flex-1 auto-rows-fr" : ""}`}
                >
                  {([0, 1] as const).map((position) => {
                    const side = (mirrored ? 1 - position : position) as 0 | 1;
                    return (
                      <div
                        key={side}
                        className={`min-w-0 cursor-pointer rounded-xl border-2 p-1 text-center sm:p-3 ${teamsFullscreen ? "flex min-h-0 flex-col overflow-hidden" : ""} ${side === 0 ? "border-red-500 bg-red-500/10" : "border-blue-500 bg-blue-500/10"}`}
                        onClick={(event) => {
                          if (
                            (event.target as HTMLElement).closest(
                              "button, input, textarea, select, [role='button']",
                            )
                          )
                            return;
                          if (completed && room.mode === "standard") return;
                          change({ type: "point", side, delta: 1 });
                        }}
                      >
                        <Input
                          className="select-text"
                          size="sm"
                          aria-label={
                            side === 0 ? "Red team name" : "Blue team name"
                          }
                          value={names[side]}
                          onValueChange={(value) =>
                            setNames(
                              (current) =>
                                current.map((n, i) =>
                                  i === side ? value : n,
                                ) as [string, string],
                            )
                          }
                          onBlur={() => {
                            if (names[side] !== room.names[side])
                              change({ type: "name", side, name: names[side] });
                          }}
                        />
                        {room.mode === "standard" && (
                          <p className="pt-2 text-xs">
                            Games won: {wins[side]}
                          </p>
                        )}
                        <div
                          style={{
                            fontSize: teamsFullscreen
                              ? `min(${scoreSize}rem, 23vw, 45dvh)`
                              : `${scoreSize}rem`,
                          }}
                          className={`flex min-h-48 w-full items-center justify-center font-bold leading-none tabular-nums overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 ${teamsFullscreen ? "min-h-0 flex-1" : ""} ${side === 0 ? "text-red-500" : "text-blue-500"}`}
                        >
                          {room.points[side]}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            className="min-w-0 flex-1"
                            isDisabled={
                              room.mode === "standard" ||
                              room.points[side] === 0
                            }
                            onPress={() =>
                              change({ type: "point", side, delta: -1 })
                            }
                          >
                            −1
                          </Button>
                          <Button
                            className="min-w-0 flex-1"
                            color={side === 0 ? "danger" : "primary"}
                            isDisabled={completed && room.mode === "standard"}
                            onPress={() =>
                              change({ type: "point", side, delta: 1 })
                            }
                          >
                            +1
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {room.games.length > 0 && (
                <p className="text-center text-sm text-default-500">
                  {room.games.map((game) => game.join("–")).join(" · ")}
                </p>
              )}
              {completed && room.mode === "standard" && (
                <p role="status" className="text-center font-semibold">
                  Winner: {room.names[wins[0] >= 2 ? 0 : 1]}
                </p>
              )}
              <Button
                color="danger"
                variant="flat"
                onPress={() => change({ type: "reset" })}
              >
                Reset scores
              </Button>
            </>
          )}
        </section>
      )}
      <Modal isOpen={showQr} onOpenChange={setShowQr} placement="center">
        <ModalContent>
          <ModalHeader>Scan to join room</ModalHeader>
          <ModalBody className="items-center pb-6">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                width={256}
                height={256}
                unoptimized
                alt={`QR code to join room ${code}`}
                className="rounded-lg bg-white p-2"
              />
            ) : (
              <p>Generating QR code…</p>
            )}
            <p className="break-all text-center text-xs text-default-500">
              {shareUrl}
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
      {syncFailed && (
        <Button size="sm" variant="flat" onPress={() => void flush()}>
          Retry pending sync
        </Button>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-danger/10 p-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </main>
  );
};
export default RealtimeBadmintonRoom;
