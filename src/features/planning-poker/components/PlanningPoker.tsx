"use client";

import { useDisclosure } from "@nextui-org/react";
import {
  deleteField,
  doc,
  DocumentReference,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";

import {
  PLANNING_POKER_ADMIN_PARAM,
  PLANNING_POKER_HISTORY_LIMIT,
  PLANNING_POKER_NOTE_MAX_LENGTH,
} from "@/features/planning-poker/constants";
import { buildRoundHistoryEntry } from "@/features/planning-poker/lib/build-round-history-entry";
import {
  DECKS,
  DeckType,
  GroupObject,
  PlayerVotes,
  RoomData,
  RoomStats,
} from "@/features/planning-poker/model/poker";
import { PLANNING_POKER_DB_NAME } from "@/shared/config/database-name";
import { environment } from "@/shared/config/environment";
import { trackEvent } from "@/shared/lib/analytics";
import { db } from "@/shared/lib/firebase";
import PlanningPokerCardSelection from "./PlanningPokerCardSelection";
import PlanningPokerConfirmKickModal from "./PlanningPokerConfirmKickModal";
import PlanningPokerConfirmResetModal from "./PlanningPokerConfirmResetModal";
import PlanningPokerDeckSettingsModal from "./PlanningPokerDeckSettingsModal";
import PlanningPokerGroups from "./PlanningPokerGroups";
import PlanningPokerHeader from "./PlanningPokerHeader";
import PlanningPokerHistoryModal from "./PlanningPokerHistoryModal";
import PlanningPokerLobby from "./PlanningPokerLobby";
import PlanningPokerRoundNote from "./PlanningPokerRoundNote";
import PlanningPokerSettingUserModal from "./PlanningPokerSettingUserModal";
import PlanningPokerStats from "./PlanningPokerStats";
import PlanningPokerTable from "./PlanningPokerTable";

const PlanningPoker: React.FC = () => {
  const {
    isOpen: isDeckSettingModalOpen,
    onOpen: onDeckSettingModalOpen,
    onOpenChange: onDeckSettingModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isSettingUserModalOpen,
    onOpen: onSettingUserModalOpen,
    onOpenChange: onSettingUserModalChange,
  } = useDisclosure();
  const {
    isOpen: isKickModalOpen,
    onOpen: onKickModalOpen,
    onOpenChange: onKickModalChange,
  } = useDisclosure();
  const {
    isOpen: isHistoryModalOpen,
    onOpen: onHistoryModalOpen,
    onOpenChange: onHistoryModalChange,
  } = useDisclosure();
  const {
    isOpen: isResetModalOpen,
    onOpen: onResetModalOpen,
    onOpenChange: onResetModalChange,
  } = useDisclosure();

  const [roomId, setRoomId] = useState<string | null>(null);
  const userId = useMemo<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("poker_user_id");
      if (saved) return saved;
      const newId = Math.random().toString(36).substring(7);
      localStorage.setItem("poker_user_id", newId);
      return newId;
    }
    return Math.random().toString(36).substring(7);
  }, []);
  const [userName, setUserName] = useState<string>("");
  const [userGroup, setUserGroup] = useState<string>("");
  const [tempName, setTempName] = useState<string>("");
  const [tempGroup, setTempGroup] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [voterToKick, setVoterToKick] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [wasKicked, setWasKicked] = useState<boolean>(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [customDeckInput, setCustomDeckInput] = useState<string>("");
  const [groupOptionsInput, setGroupOptionsInput] = useState<GroupObject[]>([]);
  const [sortByGroupInput, setSortByGroupInput] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [highlightedGroup, setHighlightedGroup] = useState<string>("");
  const [tempDeckInput, setTempDeckInput] = useState<DeckType>("fibonacci");

  const activeDeck = useMemo(() => {
    if (!roomData) return DECKS.fibonacci;
    if (roomData.deckType === "custom" && roomData.customDeck) {
      return roomData.customDeck;
    }
    return DECKS[roomData.deckType as DeckType] || DECKS.fibonacci;
  }, [roomData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setIsAdmin(
      params.get(PLANNING_POKER_ADMIN_PARAM) === environment.pokerAdminSecret,
    );
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("room");
    if (id) {
      setRoomId(id);
      const docRef = doc(
        db,
        PLANNING_POKER_DB_NAME,
        id,
      ) as DocumentReference<RoomData>;
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRoomData(data);
            setUserName(
              (userName) =>
                (data.votes && data.votes?.[userId]?.name) || userName,
            );
            setUserGroup(
              (userGroup) =>
                (data.votes && data.votes?.[userId]?.group) || userGroup,
            );
          }
        })
        .catch(() => {
          window.location.search = "";
        })
        .finally(() => setLoading(false));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!roomId || !isJoined) return;
    const docRef = doc(
      db,
      PLANNING_POKER_DB_NAME,
      roomId,
    ) as DocumentReference<RoomData>;
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // An admin removed us from the room -> drop back to the lobby.
        if (!data.votes?.[userId]) {
          setIsJoined(false);
          setWasKicked(true);
          return;
        }
        setRoomData(data);
        if (data.deckType)
          setTempDeckInput((deckType) => deckType || data.deckType);
        if (data.customDeck)
          setCustomDeckInput(
            (customDeck) => customDeck || (data.customDeck || []).join(", "),
          );
        if (data.groupOptions) {
          setGroupOptionsInput((groupOptions) =>
            groupOptions.length > 0 ? groupOptions : (data.groupOptions ?? []),
          );
        }
        if (data.sortByGroup !== undefined) {
          setSortByGroupInput(
            (sortByGroup) => sortByGroup || (data.sortByGroup ?? false),
          );
        }
        if (data.votes?.[userId]) {
          setUserName((prev) => data.votes[userId].name || prev);
          setUserGroup(data.votes[userId].group || "");
        }
      }
    });
    return () => unsubscribe();
  }, [roomId, isJoined, userId]);

  useEffect(() => {
    const handleUnload = () => {
      if (roomId && isJoined && userId) {
        setDoc(
          doc(db, PLANNING_POKER_DB_NAME, roomId),
          { votes: { [userId]: deleteField() } },
          { merge: true },
        );
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [roomId, isJoined, userId]);

  const stats: RoomStats | null = useMemo(() => {
    if (!roomData?.votes) return null;
    const total = Object.values(roomData.votes).filter(
      (v) => v.score !== null,
    ).length;
    const scores = Object.values(roomData.votes)
      .map((v) => v.score)
      .filter((s): s is string => s !== null && !isNaN(Number(s)))
      .map(Number);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { avg: scores.length > 0 ? avg.toFixed(1) : "-", total };
  }, [roomData]);

  const handleJoin = async () => {
    if (!roomId || !userName) return;
    setWasKicked(false);
    // No prior room doc (or no players yet) means this user is effectively
    // creating the room rather than joining an existing one.
    const existingPlayers = roomData
      ? Object.keys(roomData.votes ?? {}).length
      : 0;
    void trackEvent(
      existingPlayers === 0 ? "poker_create_room" : "poker_join_room",
      {
        player_count: existingPlayers,
        has_group: Boolean(userGroup?.trim()),
      },
    );
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      {
        votes: {
          [userId]: {
            name: userName,
            score: null,
            group: userGroup?.trim() || null,
          },
        },
      },
      { merge: true },
    );
    setIsJoined(true);
  };

  const openEditVoter = (targetId: string) => {
    const voter = roomData?.votes?.[targetId];
    if (!voter) return;
    setEditingUserId(targetId);
    setTempName(voter.name);
    setTempGroup(voter.group ?? "");
    onSettingUserModalOpen();
  };

  const handleUpdateVoterData = async () => {
    const targetId = editingUserId ?? userId;
    if (!roomId || !tempName.trim()) return;
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      {
        votes: {
          [targetId]: {
            name: tempName.trim(),
            group: tempGroup.trim() || null,
          },
        },
      },
      { merge: true },
    );
    if (targetId === userId) {
      setUserName(tempName.trim());
      setUserGroup(tempGroup.trim());
    }
  };

  const requestRemoveVoter = (targetId: string) => {
    if (!isAdmin) return;
    setVoterToKick(targetId);
    onKickModalOpen();
  };

  const confirmRemoveVoter = async () => {
    if (!roomId || !isAdmin || !voterToKick) return;
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { votes: { [voterToKick]: deleteField() } },
      { merge: true },
    );
    setVoterToKick(null);
  };

  const handleVote = async (score: string) => {
    if (!roomId || !roomData) return;
    const current = roomData.votes?.[userId]?.score;
    const nextScore = current === score ? null : score;
    // Only a cast vote is interesting; toggling the same card off is a no-op.
    if (nextScore !== null) {
      void trackEvent("poker_vote", {
        card: nextScore,
        deck_type: roomData.deckType ?? "fibonacci",
      });
    }
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      {
        votes: {
          [userId]: { name: userName, score: nextScore },
        },
      },
      { merge: true },
    );
  };

  const toggleReveal = async () => {
    const nextRevealed = !roomData?.revealed;
    void trackEvent("poker_reveal", { revealed: nextRevealed });
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId!),
      { revealed: nextRevealed },
      { merge: true },
    );
  };

  const resetRound = async () => {
    if (!roomId || !roomData) return;
    const resetVotes: PlayerVotes = {};
    Object.keys(roomData.votes).forEach((id) => {
      resetVotes[id] = { ...roomData.votes[id], score: null };
    });
    setHighlightedGroup("");

    // Snapshot a revealed round that had at least one cast vote into the shared
    // history before clearing it, keeping only the most recent entries.
    const history =
      roomData.revealed && stats && stats.total > 0
        ? [
            buildRoundHistoryEntry(roomData, stats),
            ...(roomData.history ?? []),
          ].slice(0, PLANNING_POKER_HISTORY_LIMIT)
        : undefined;

    void trackEvent("poker_reset_round", {
      recorded: Boolean(history),
      player_count: Object.keys(roomData.votes).length,
    });

    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      {
        revealed: false,
        votes: resetVotes,
        // The note describes the round that just ended — it rides along into
        // the history entry above, so the next round starts without one.
        note: deleteField(),
        ...(history ? { history } : {}),
      },
      { merge: true },
    );
  };

  // Guard against accidentally wiping in-progress hidden votes: while a round
  // is still hidden, ask for confirmation before resetting. Once revealed the
  // votes are already public, so reset proceeds immediately.
  const requestReset = () => {
    if (roomData && !roomData.revealed) {
      onResetModalOpen();
    } else {
      resetRound();
    }
  };

  const clearHistory = async () => {
    if (!roomId || !isAdmin) return;
    void trackEvent("poker_clear_history", {
      entries: roomData?.history?.length ?? 0,
    });
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { history: [] },
      { merge: true },
    );
  };

  // The note for the round in play. It is shared room state, so anyone can set
  // it, and `buildRoundHistoryEntry` copies it into the history snapshot when
  // the round is reset.
  const updateRoundNote = async (note: string) => {
    if (!roomId) return;
    const trimmed = note.trim().slice(0, PLANNING_POKER_NOTE_MAX_LENGTH);
    void trackEvent("poker_round_note", {
      action: trimmed ? "save" : "clear",
    });
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { note: trimmed ? trimmed : deleteField() },
      { merge: true },
    );
  };

  // Notes live inside the history array, and Firestore can't patch a single
  // array element — so the whole array is rewritten on every edit. Clearing a
  // note drops the key rather than storing "", keeping entries uniform.
  const updateHistoryNote = async (entryId: string, note: string) => {
    if (!roomId || !roomData?.history) return;
    const trimmed = note.trim().slice(0, PLANNING_POKER_NOTE_MAX_LENGTH);
    const history = roomData.history.map((entry) => {
      if (entry.id !== entryId) return entry;
      const { note: _previous, ...rest } = entry;
      return trimmed ? { ...rest, note: trimmed } : rest;
    });
    void trackEvent("poker_history_note", {
      action: trimmed ? "save" : "clear",
    });
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { history },
      { merge: true },
    );
  };

  const openHistory = () => {
    void trackEvent("poker_view_history", {
      entries: roomData?.history?.length ?? 0,
    });
    onHistoryModalOpen();
  };

  const updateDeckSettings = async (type: DeckType, customStr?: string) => {
    if (!roomId) return;
    const customValues = customStr
      ? customStr
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v !== "")
      : roomData?.customDeck || [];
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { deckType: type, customDeck: customValues },
      { merge: true },
    );
  };

  const updateSortByGroup = async (value: boolean) => {
    if (!roomId) return;
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { sortByGroup: value },
      { merge: true },
    );
  };

  const updateGroupSettings = async (groupOptions: GroupObject[]) => {
    if (!roomId) return;
    const cleaned = groupOptions
      .map((g) => ({ name: g.name.trim(), color: g.color }))
      .filter((g) => g.name !== "");
    const groups = new Set(cleaned.map((g) => g.name));
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { groupOptions: cleaned, groups: Array.from(groups) },
      { merge: true },
    );
  };

  const handleOpenDeckSettings = () => {
    setTempDeckInput(roomData?.deckType ?? "fibonacci");
    setCustomDeckInput(roomData?.customDeck?.join(", ") ?? "");
    setGroupOptionsInput(roomData?.groupOptions ?? []);
    setSortByGroupInput(roomData?.sortByGroup ?? false);
    onDeckSettingModalOpen();
  };

  if (!roomId || !isJoined) {
    return (
      <PlanningPokerLobby
        loading={loading}
        roomId={roomId}
        roomData={roomData}
        userGroup={userGroup}
        wasKicked={wasKicked}
        setUserGroup={setUserGroup}
        setUserName={setUserName}
        handleJoin={handleJoin}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 sm:gap-3 max-w-6xl mx-auto px-4 md:px-8 py-2">
      {/* 1. Header */}
      <PlanningPokerHeader
        roomData={roomData}
        isAdmin={isAdmin}
        historyCount={roomData?.history?.length ?? 0}
        toggleReveal={toggleReveal}
        resetRound={requestReset}
        onOpenHistory={openHistory}
      />

      {/* 2. Stats Section */}
      <PlanningPokerStats roomData={roomData} stats={stats} roomId={roomId} />

      {roomData && (
        <PlanningPokerGroups
          roomData={roomData}
          highlightedGroup={highlightedGroup}
          setHighlightedGroup={setHighlightedGroup}
          stats={stats}
        />
      )}

      {/* 2b. What this round is estimating */}
      <div className="flex items-center justify-center flex-col gap-2">
        <PlanningPokerRoundNote
          note={roomData?.note}
          onUpdateNote={updateRoundNote}
        />
      </div>

      {/* 3. Main Card Table */}
      <PlanningPokerTable
        roomData={roomData}
        userId={userId}
        isAdmin={isAdmin}
        onEditVoter={openEditVoter}
        onRemoveVoter={requestRemoveVoter}
        highlightedGroup={highlightedGroup}
      />

      {/* 4. Card Selection & Settings Button */}
      <PlanningPokerCardSelection
        activeDeck={activeDeck}
        roomData={roomData}
        userId={userId}
        handleVote={handleVote}
        onClickSettings={handleOpenDeckSettings}
      />

      {/* 5. Deck Settings Modal */}
      <PlanningPokerDeckSettingsModal
        isOpen={isDeckSettingModalOpen}
        onOpenChange={onDeckSettingModalOpenChange}
        setTempDeckInput={setTempDeckInput}
        tempDeckInput={tempDeckInput}
        setCustomDeckInput={setCustomDeckInput}
        customDeckInput={customDeckInput}
        setGroupOptionsInput={setGroupOptionsInput}
        groupOptionsInput={groupOptionsInput}
        sortByGroupInput={sortByGroupInput}
        setSortByGroupInput={setSortByGroupInput}
        updateDeckSettings={updateDeckSettings}
        updateGroupSettings={updateGroupSettings}
        updateSortByGroup={updateSortByGroup}
      />

      {/* 6. Rename User Modal */}
      <PlanningPokerSettingUserModal
        isOpen={isSettingUserModalOpen}
        onOpenChange={onSettingUserModalChange}
        tempName={tempName}
        setTempName={setTempName}
        tempGroup={tempGroup}
        setTempGroup={setTempGroup}
        roomData={roomData}
        isEditingOther={editingUserId !== null && editingUserId !== userId}
        handleUpdateVoterData={handleUpdateVoterData}
      />

      {/* 7. Confirm Kick Modal */}
      <PlanningPokerConfirmKickModal
        isOpen={isKickModalOpen}
        onOpenChange={onKickModalChange}
        voterName={
          voterToKick ? roomData?.votes?.[voterToKick]?.name : undefined
        }
        onConfirm={confirmRemoveVoter}
      />

      {/* 8. Round History Modal */}
      <PlanningPokerHistoryModal
        isOpen={isHistoryModalOpen}
        onOpenChange={onHistoryModalChange}
        history={roomData?.history ?? []}
        groupOptions={roomData?.groupOptions ?? []}
        isAdmin={isAdmin}
        onClearHistory={clearHistory}
        onUpdateNote={updateHistoryNote}
      />

      {/* 9. Confirm Reset Modal (only shown while votes are still hidden) */}
      <PlanningPokerConfirmResetModal
        isOpen={isResetModalOpen}
        onOpenChange={onResetModalChange}
        onConfirm={resetRound}
      />
    </div>
  );
};

export default PlanningPoker;
