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
import { connectRoomPresence, RoomParticipant } from "@/features/badminton/lib/room-presence";
import { connectScorePeers } from "@/features/badminton/lib/webrtc-room";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect, useRef, useState } from "react";

const RealtimeBadmintonRoom = () => {
  const [entry, setEntry] = useState("");
  const [newName, setNewName] = useState("");
  const [code, setCode] = useState("");
  const [room, setRoom] = useState<ScoreRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scoreSize, setScoreSize] = useState(6);
  const [connection, setConnection] = useState<
    "firebase" | "direct" | "connecting"
  >("firebase");
  const revisionRef = useRef(-1);
  const confirmedRef = useRef<ScoreRoom | null>(null);
  const roomCodeRef = useRef("");
  const roomRef = useRef<ScoreRoom | null>(null);
  const pendingRef = useRef<Parameters<typeof updateRoom>[1][]>([]);
  const busyRef = useRef(false);
  const [syncFailed, setSyncFailed] = useState(false);
  const [syncMode, setSyncMode] = useState<"firebase" | "p2p">("firebase");
  const [syncing, setSyncing] = useState(false);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [names, setNames] = useState<[string, string]>(["", ""]);
  useEffect(() => {
    const url = new URL(window.location.href);
    const requested = normalizeCode(url.searchParams.get("room") || "");
    if (requested) setCode(requested);
  }, []);
  useEffect(() => {
    if (!code) return;
    roomCodeRef.current = code;
    revisionRef.current = -1;
    confirmedRef.current = null;
    const peer = syncMode === "p2p" ? connectScorePeers(
      code,
      (incoming) => {
        if (incoming.revision <= revisionRef.current) return;
        revisionRef.current = incoming.revision;
        confirmedRef.current = incoming;
        if (!pendingRef.current.length) {
          roomRef.current = incoming;
          setRoom(incoming);
        }
      },
      setConnection,
    ) : null;
    const unsubscribe = subscribeRoom(code, (value) => {
      if (!value) { setError("Room not found."); return; }
      if (value.revision < revisionRef.current) return;
      revisionRef.current = value.revision;
      confirmedRef.current = value;
      if (!pendingRef.current.length) {
        roomRef.current = value;
        setRoom(value);
      }
      setNames(value.names);
      peer?.broadcast(value);
    }, (cause) => setError(cause.message));
    return () => { unsubscribe(); peer?.(); };
  }, [code, syncMode]);
  useEffect(() => {
    if (!code) { setParticipants([]); return; }
    const session = connectRoomPresence(code, setParticipants, (cause) => setError(cause.message));
    return session.disconnect;
  }, [code]);
  const enter = (next: string) => {
    setError("");
    setRoom(null);
    roomRef.current = null;
    pendingRef.current = [];
    confirmedRef.current = null;
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
        if (roomCodeRef.current !== code) break;
        pendingRef.current.shift();
      }
      if (roomCodeRef.current === code && !pendingRef.current.length && confirmedRef.current) {
        // A server snapshot may arrive after the transaction resolves.
        // The subscription will reconcile the final authoritative state.
        setSyncing(false);
      }
    } catch (cause) {
      if (roomCodeRef.current === code) {
        setSyncFailed(true);
        setError(cause instanceof Error ? cause.message : "Score sync failed.");
      }
    } finally {
      busyRef.current = false;
      if (roomCodeRef.current === code) setSyncing(pendingRef.current.length > 0);
    }
  }, [code]);
  const change = useCallback((action: Parameters<typeof updateRoom>[1]) => {
    const current = roomRef.current;
    if (!current) return;
    const next = applyRoomAction(current, action);
    if (next === current) return;
    roomRef.current = next;
    setRoom(next);
    pendingRef.current.push(action);
    setError("");
    void flush();
  }, [flush]);
  const leave = () => {
    roomCodeRef.current = "";
    setCode("");
    setRoom(null);
    roomRef.current = null;
    pendingRef.current = [];
    confirmedRef.current = null;
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
    <main className="w-full space-y-4 px-2 py-4 sm:px-4 lg:px-6">
      <header className="rounded-2xl bg-content1 p-3">
        <h1 className="text-2xl font-bold">Live Badminton Scoreboard</h1>
        <p className="text-sm text-default-500">
          Create or join a named room to score together in real time.
        </p>
      </header>
      {!code ? (
        <section className="space-y-4 rounded-2xl bg-content1 p-4">
          <Input
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
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-content1 p-3">
            <span className="mr-auto font-mono font-bold">Room: {code}</span>
            <div className="flex items-center gap-2" role="group" aria-label="Sync transport">
              <Button size="sm" color={syncMode === "firebase" ? "primary" : "default"} variant={syncMode === "firebase" ? "solid" : "flat"} onPress={() => setSyncMode("firebase")}>Firebase Sync</Button>
              <Button size="sm" color={syncMode === "p2p" ? "primary" : "default"} variant={syncMode === "p2p" ? "solid" : "flat"} onPress={() => setSyncMode("p2p")}>LAN / P2P</Button>
            </div>
            <span role="status" className="text-xs text-default-500">
              {syncing ? "Saving…" : syncMode === "p2p" && connection === "direct" ? "P2P connected · Firebase persistence" : syncMode === "p2p" ? "Connecting P2P · Firebase persistence" : "Firebase sync"}
            </span>
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
          <div className="rounded-2xl bg-content1 p-3 space-y-2" aria-label="Room participants">
            <p className="font-semibold">Online participants ({participants.length})</p>
            {participants.length ? <ul className="flex flex-wrap gap-2">{participants.map((person) => <li key={person.id} className="rounded-full bg-success/10 px-3 py-1 text-xs text-success">● {person.name}</li>)}</ul> : <p className="text-xs text-default-500">Waiting for participants…</p>}
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
                  <span className="text-xs tabular-nums text-default-500">
                    {scoreSize}rem
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
                    isDisabled={scoreSize === 20}
                    onPress={() => setScoreSize((n) => Math.min(20, n + 1))}
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
      {syncFailed && <Button size="sm" variant="flat" onPress={() => void flush()}>Retry pending sync</Button>}
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
