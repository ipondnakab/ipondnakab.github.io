"use client";

import {
  createRoom,
  newRoomCode,
  normalizeCode,
  roomExists,
  ScoreRoom,
  subscribeRoom,
  updateRoom,
  winnerOf,
} from "@/features/badminton/lib/realtime-room";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";

const RealtimeBadmintonRoom = () => {
  const [entry, setEntry] = useState("");
  const [code, setCode] = useState("");
  const [room, setRoom] = useState<ScoreRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scoreSize, setScoreSize] = useState(6);
  const [names, setNames] = useState<[string, string]>(["", ""]);
  useEffect(() => {
    const url = new URL(window.location.href);
    const requested = normalizeCode(url.searchParams.get("room") || "");
    if (requested.length === 8) setCode(requested);
  }, []);
  useEffect(() => {
    if (!code) return;
    const unsubscribe = subscribeRoom(
      code,
      (value) => {
        setRoom(value);
        if (value) setNames(value.names);
        else setError("Room not found.");
      },
      (cause) => setError(cause.message),
    );
    return () => unsubscribe();
  }, [code]);
  const enter = (next: string) => {
    setError("");
    setRoom(null);
    setCode(next);
    const url = new URL(window.location.href);
    url.searchParams.set("room", next);
    window.history.replaceState(null, "", url.toString());
  };
  const create = async () => {
    setLoading(true);
    setError("");
    try {
      let next = newRoomCode();
      while (await roomExists(next)) next = newRoomCode();
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
    if (next.length !== 8) {
      setError("Enter an 8-character room code.");
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
  const change = useCallback(
    async (action: Parameters<typeof updateRoom>[1]) => {
      try {
        setError("");
        await updateRoom(code, action);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Update failed.");
      }
    },
    [code],
  );
  const leave = () => {
    setCode("");
    setRoom(null);
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
    <main className="w-full space-y-4 px-2 py-4 sm:px-4 lg:px-6">
      <header className="rounded-2xl bg-content1 p-3">
        <h1 className="text-2xl font-bold">Live Badminton Scoreboard</h1>
        <p className="text-sm text-default-500">
          Share a room code to score together in real time.
        </p>
      </header>
      {!code ? (
        <section className="space-y-4 rounded-2xl bg-content1 p-4">
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
              label="Room code"
              placeholder="8-character code"
              value={entry}
              onValueChange={(value) => setEntry(normalizeCode(value))}
              maxLength={8}
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
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-content1 p-3">
            <span className="mr-auto font-mono font-bold">Room: {code}</span>
            <Button
              size="sm"
              variant="flat"
              onPress={() =>
                navigator.clipboard.writeText(window.location.href)
              }
            >
              Copy link
            </Button>
            <Button size="sm" variant="light" onPress={leave}>
              Leave
            </Button>
          </div>
          {!room ? (
            <p role="status" className="p-4">
              Connecting to room...
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 rounded-xl bg-content1 p-2">
                <div className="flex gap-2">
                  {(["standard", "freehand"] as const).map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      color={room.mode === mode ? "primary" : "default"}
                      variant={room.mode === mode ? "solid" : "flat"}
                      onPress={() => change({ type: "mode", mode })}
                    >
                      {mode === "standard" ? "Standard" : "Freehand"}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs tabular-nums text-default-500">{scoreSize}rem</span>
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
                    isDisabled={scoreSize === 20}
                    onPress={() => setScoreSize((n) => Math.min(20, n + 1))}
                  >
                    A+
                  </Button>
                  <Button size="sm" variant="flat" onPress={() => setScoreSize(6)} aria-label="Reset score font size">Reset</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 sm:gap-3">
                {([0, 1] as const).map((side) => (
                  <div
                    key={side}
                    className={`min-w-0 rounded-xl border-2 p-1 text-center sm:p-3 ${side === 0 ? "border-red-500 bg-red-500/10" : "border-blue-500 bg-blue-500/10"}`}
                  >
                    <Input
                      size="sm"
                      aria-label={
                        side === 0 ? "Red team name" : "Blue team name"
                      }
                      value={names[side]}
                      onValueChange={(value) =>
                        setNames(
                          (current) =>
                            current.map((n, i) => (i === side ? value : n)) as [
                              string,
                              string,
                            ],
                        )
                      }
                      onBlur={() => {
                        if (names[side] !== room.names[side])
                          change({ type: "name", side, name: names[side] });
                      }}
                    />
                    {room.mode === "standard" && (
                      <p className="pt-2 text-xs">Games won: {wins[side]}</p>
                    )}
                    <button
                      type="button"
                      disabled={completed && room.mode === "standard"}
                      aria-label={`Add point for ${room.names[side]}`}
                      onClick={() => change({ type: "point", side, delta: 1 })}
                      style={{ fontSize: `${scoreSize}rem` }}
                      className={`flex min-h-48 w-full items-center justify-center font-bold leading-none tabular-nums overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 ${side === 0 ? "text-red-500" : "text-blue-500"}`}
                    >
                      {room.points[side]}
                    </button>
                    <div className="flex gap-1">
                      <Button
                        className="min-w-0 flex-1"
                        isDisabled={
                          room.mode === "standard" || room.points[side] === 0
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
                ))}
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
