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

import { PLANNING_POKER_DB_NAME } from "@/constants/database-name";
import {
  DECKS,
  DeckType,
  PlayerVotes,
  RoomData,
  RoomStats,
} from "@/interfaces/poker";
import { db } from "@/libs/firebase";
import PlanningPokerCardSelection from "./PlanningPokerCardSelection";
import PlanningPokerDeckSettingsModal from "./PlanningPokerDeckSettingsModal";
import PlanningPokerGroupButton from "./PlanningPokerGroupButton";
import PlanningPokerHeader from "./PlanningPokerHeader";
import PlanningPokerLobby from "./PlanningPokerLobby";
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

  const [roomId, setRoomId] = useState<string | null>(null);
  const [userId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("poker_user_id");
      if (saved) return saved;
      const newId = Math.random().toString(36).substring(7);
      localStorage.setItem("poker_user_id", newId);
      return newId;
    }
    return "";
  });
  const [userName, setUserName] = useState<string>("");
  const [userGroup, setUserGroup] = useState<string>("");
  const [tempName, setTempName] = useState<string>("");
  const [tempGroup, setTempGroup] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [customDeckInput, setCustomDeckInput] = useState("");
  const [groupInput, setGroupInput] = useState("");
  const [loading, setLoading] = useState(true);
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
            setRoomData(docSnap.data());
            setUserName(docSnap.data().votes[userId]?.name || userName);
            setUserGroup(docSnap.data().votes[userId]?.group || userGroup);
          }
        })
        .catch(() => {
          window.location.search = "";
        })
        .finally(() => setLoading(false));
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setRoomData(data);
        if (data.deckType) setTempDeckInput(data.deckType);
        if (data.customDeck) setCustomDeckInput(data.customDeck.join(", "));
        if (data.groups) setGroupInput(data.groups.join(", "));
        if (data.votes[userId]) {
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

  const handleUpdateVoterData = async () => {
    if (!roomId || !tempName.trim()) return;
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      {
        votes: {
          [userId]: {
            name: tempName.trim(),
            group: tempGroup.trim() || null,
          },
        },
      },
      { merge: true },
    );
    setUserName(tempName.trim());
    setUserGroup(tempGroup.trim());
  };

  const handleVote = async (score: string) => {
    if (!roomId || !roomData) return;
    const current = roomData.votes[userId]?.score;
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      {
        votes: {
          [userId]: { name: userName, score: current === score ? null : score },
        },
      },
      { merge: true },
    );
  };

  const toggleReveal = async () =>
    setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId!),
      { revealed: !roomData?.revealed },
      { merge: true },
    );

  const resetRound = async () => {
    const resetVotes: PlayerVotes = {};
    Object.keys(roomData!.votes).forEach((id) => {
      resetVotes[id] = { ...roomData!.votes[id], score: null };
    });
    setHighlightedGroup("");
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId!),
      { revealed: false, votes: resetVotes },
      { merge: true },
    );
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

  const updateGroupSettings = async (groupStr: string) => {
    if (!roomId) return;
    const groups = groupStr
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g !== "");
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { groups },
      { merge: true },
    );
  };

  if (!roomId || !isJoined) {
    return (
      <PlanningPokerLobby
        loading={loading}
        roomId={roomId}
        roomData={roomData}
        userGroup={userGroup}
        setUserGroup={setUserGroup}
        setUserName={setUserName}
        handleJoin={handleJoin}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 max-w-6xl mx-auto px-4 md:px-8 py-2">
      {/* 1. Header */}
      <PlanningPokerHeader
        roomData={roomData}
        toggleReveal={toggleReveal}
        resetRound={resetRound}
      />

      {/* 2. Stats Section */}
      <PlanningPokerStats roomData={roomData} stats={stats} roomId={roomId} />

      {roomData?.groups && roomData.groups.length > 0 && (
        <div className="flex flex-1 items-center flex-wrap justify-center gap-6">
          {roomData.groups.map((group) => (
            <PlanningPokerGroupButton
              key={group}
              highlightedGroup={highlightedGroup}
              group={group}
              setHighlightedGroup={setHighlightedGroup}
              roomData={roomData}
            />
          ))}
        </div>
      )}

      {/* 3. Main Card Table */}
      <PlanningPokerTable
        roomData={roomData}
        userId={userId}
        userName={userName}
        userGroup={userGroup}
        setTempName={setTempName}
        setTempGroup={setTempGroup}
        onRenameOpen={onSettingUserModalOpen}
        highlightedGroup={highlightedGroup}
      />

      {/* 4. Card Selection & Settings Button */}
      <PlanningPokerCardSelection
        activeDeck={activeDeck}
        roomData={roomData}
        userId={userId}
        handleVote={handleVote}
        onClickSettings={onDeckSettingModalOpen}
      />

      {/* 5. Deck Settings Modal */}
      <PlanningPokerDeckSettingsModal
        isOpen={isDeckSettingModalOpen}
        onOpenChange={onDeckSettingModalOpenChange}
        setTempDeckInput={setTempDeckInput}
        tempDeckInput={tempDeckInput}
        setCustomDeckInput={setCustomDeckInput}
        customDeckInput={customDeckInput}
        setGroupInput={setGroupInput}
        groupInput={groupInput}
        updateDeckSettings={updateDeckSettings}
        updateGroupSettings={updateGroupSettings}
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
        handleUpdateVoterData={handleUpdateVoterData}
      />
    </div>
  );
};

export default PlanningPoker;
