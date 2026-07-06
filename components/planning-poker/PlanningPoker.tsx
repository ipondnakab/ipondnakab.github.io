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
import { PLANNING_POKER_ADMIN_PARAM } from "@/constants/planning-poker";
import { environment } from "@/core/environment";
import {
  DECKS,
  DeckType,
  GroupObject,
  PlayerVotes,
  RoomData,
  RoomStats,
} from "@/interfaces/poker";
import { db } from "@/libs/firebase";
import PlanningPokerCardSelection from "./PlanningPokerCardSelection";
import PlanningPokerConfirmKickModal from "./PlanningPokerConfirmKickModal";
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
  const {
    isOpen: isKickModalOpen,
    onOpen: onKickModalOpen,
    onOpenChange: onKickModalChange,
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
    <div className="flex flex-1 flex-col gap-4 max-w-6xl mx-auto px-4 md:px-8 py-2">
      {/* 1. Header */}
      <PlanningPokerHeader
        roomData={roomData}
        isAdmin={isAdmin}
        toggleReveal={toggleReveal}
        resetRound={resetRound}
      />

      {/* 2. Stats Section */}
      <PlanningPokerStats roomData={roomData} stats={stats} roomId={roomId} />

      {roomData?.groupOptions && roomData.groupOptions.length > 0 && (
        <div className="flex flex-1 items-center flex-wrap justify-center gap-4">
          {roomData.groupOptions.map((group) => (
            <PlanningPokerGroupButton
              key={group.name}
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
    </div>
  );
};

export default PlanningPoker;
