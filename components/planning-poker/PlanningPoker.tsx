"use client";

import {
  Button,
  Card,
  Chip,
  cn,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Tab,
  Tabs,
  useDisclosure,
} from "@nextui-org/react";
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
  IoCafeOutline,
  IoEye,
  IoEyeOff,
  IoHelpOutline,
  IoPencil,
  IoPeople,
  IoRefresh,
  IoSettingsOutline,
} from "react-icons/io5";

import { PLANNING_POKER_DB_NAME } from "@/constants/database-name";
import { DECKS, DeckType, PlayerVotes, RoomData } from "@/interfaces/poker";
import { db } from "@/libs/firebase";

const PlanningPoker: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isRenameOpen,
    onOpen: onRenameOpen,
    onOpenChange: onRenameOpenChange,
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

  const stats = useMemo(() => {
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
      <div className=" flex items-center justify-center p-8 py-16 h-[calc(100vh-4rem)]">
        {!roomId ? (
          <Card isBlurred className="max-w-sm w-full p-8 gap-4 shadow-xl">
            <h2 className="text-xl font-bold self-center">
              Welcome to Planning Poker
            </h2>
            {loading ? (
              <Spinner size="lg" className="mx-auto" />
            ) : (
              <>
                <Button
                  color="primary"
                  size="lg"
                  onPress={() =>
                    (window.location.search = `?room=${Math.random().toString(36).substring(7)}`)
                  }
                >
                  Start New Game
                </Button>
                <Divider />

                <form
                  className="flex flex-row items-center gap-4 pl-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const id = formData.get("roomId")?.toString().trim();
                    if (id) {
                      window.location.search = `?room=${id}`;
                    }
                  }}
                >
                  <span>Or</span>
                  <Input
                    name="roomId"
                    variant="bordered"
                    placeholder="Enter Room ID to Join"
                    onKeyDown={(e) =>
                      e.key === "Enter" && e.currentTarget.form?.requestSubmit()
                    }
                  />
                  <Button color="primary" type="submit">
                    Join Game
                  </Button>
                </form>
              </>
            )}
          </Card>
        ) : (
          <Card isBlurred className="max-w-sm w-full p-8 gap-4 shadow-xl">
            <h2 className="text-xl font-bold">Your Name</h2>
            <Input
              variant="bordered"
              placeholder="Enter name..."
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            {roomData?.groups && roomData?.groups?.length > 0 && (
              <>
                <h2 className="text-xl font-bold">Select Group</h2>
                <div className="flex flex-wrap gap-2">
                  {roomData.groups.map((group) => (
                    <Chip
                      key={group}
                      variant={userGroup === group ? "solid" : "flat"}
                      color="primary"
                      onClick={() =>
                        group == userGroup
                          ? setUserGroup("")
                          : setUserGroup(group)
                      }
                      className="cursor-pointer select-none"
                    >
                      {group}
                    </Chip>
                  ))}
                </div>
              </>
            )}
            <Button color="primary" onPress={() => handleJoin()}>
              Join Table
            </Button>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 max-w-6xl mx-auto px-4 md:px-8 py-2">
      {/* 1. Header */}
      <Card
        isBlurred
        className="flex flex-row justify-between items-center p-4 rounded-3xl shadow-sm"
      >
        <div className="flex gap-2 items-center">
          <Chip
            variant="flat"
            color="primary"
            startContent={<IoPeople className="ml-1" />}
          >
            {Object.keys(roomData?.votes || {}).length} Players
          </Chip>
          <span className="md:inline hidden text-[12px]">
            Let&apos;s estimate this together 🚀
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            onPress={resetRound}
            startContent={<IoRefresh />}
          >
            Reset
          </Button>
          <Button
            size="sm"
            color="primary"
            className="font-bold"
            onPress={toggleReveal}
            startContent={roomData?.revealed ? <IoEyeOff /> : <IoEye />}
          >
            {roomData?.revealed ? "Hide" : "Reveal"}
          </Button>
        </div>
      </Card>

      {/* 2. Stats Section */}
      <Card
        isBlurred
        className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 shadow-sm"
      >
        <div className="flex flex-col items-center border-r border-default-100">
          <span className="font-bold uppercase tracking-widest text-default-400">
            Average
          </span>
          <span className="text-2xl font-black text-primary">
            {roomData?.revealed ? stats?.avg : "?"}
          </span>
          <span className="text-[10px] text-default-400 mt-1">
            Based on revealed votes
          </span>
        </div>
        <div className="flex flex-col items-center md:border-r border-default-100">
          <span className="font-bold uppercase tracking-widest text-default-400">
            Votes
          </span>
          <span className="text-2xl font-black">
            {stats?.total} / {Object.keys(roomData?.votes || {}).length}
          </span>
          <span className="text-[10px] text-default-400 mt-1">
            Total votes cast{" "}
            {`(${(((stats?.total || 0) / (Object.keys(roomData?.votes || {}).length || 1)) * 100).toFixed(0)}%)`}
          </span>
        </div>
        <div className="flex flex-col items-center border-r border-default-100">
          <span className="font-bold uppercase tracking-widest text-default-400">
            Status
          </span>
          <Chip
            size="sm"
            variant="flat"
            color={roomData?.revealed ? "success" : "warning"}
            className="mt-1 font-bold tracking-tighter"
          >
            {roomData?.revealed ? "REVEALED" : "VOTING"}
          </Chip>
          <span className="text-[10px] text-default-400 mt-1">
            {roomData?.revealed
              ? "Votes are visible to everyone"
              : "Votes are hidden until reveal"}
          </span>
        </div>
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
        >
          <span className="font-bold uppercase tracking-widest text-primary">
            Room ID
          </span>
          <span className="text-sm font-bold mt-1 uppercase">{roomId}</span>
          <span className="text-[10px] text-default-400 mt-1">
            Click to copy link
          </span>
        </div>
      </Card>

      {roomData?.groups && roomData.groups.length > 0 && (
        <div className="flex flex-1 items-center flex-wrap justify-center gap-6">
          {roomData.groups.map((group) => (
            <Button
              key={group}
              variant="faded"
              className={cn(
                "cursor-pointer flex flex-row gap-2 justify-between select-none p-4 py-2 min-w-36 items-center border border-default-100",
                {
                  "border-2 border-primary": highlightedGroup === group,
                },
              )}
              onPress={() =>
                setHighlightedGroup((prev) => (prev === group ? "" : group))
              }
            >
              <span className="text-xl text-primary mb-1 text-center">
                {group}
              </span>
              <span className="font-bold text-xl mb-1 text-center">
                {roomData.revealed
                  ? Object.values(roomData.votes)
                      .filter((v) => v.group === group)
                      .map((v) => v.score)
                      .filter(
                        (s): s is string => s !== null && !isNaN(Number(s)),
                      )
                      .map(Number)
                      .reduce((a, b, _, arr) => a + b / arr.length, 0)
                      .toFixed(1)
                  : "?"}
              </span>
            </Button>
          ))}
        </div>
      )}

      {/* 3. Main Card Table */}
      <Card
        isBlurred
        className="flex-1 min-h-[340px] p-4 flex items-center justify-center shadow-sm"
      >
        <div className="w-full h-full flex flex-wrap items-center justify-center gap-8">
          {Object.entries(roomData?.votes || {})
            .sort(([uidA], [uidB]) => uidA.localeCompare(uidB))
            .map(([uid, data]) => {
              const hasVoted = data.score !== null;
              const isRevealed = roomData?.revealed;
              const isMe = uid === userId;

              return (
                <div
                  key={uid}
                  className={cn(
                    "flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300",
                    {
                      "opacity-25":
                        highlightedGroup && data.group !== highlightedGroup,
                    },
                  )}
                >
                  <div className={"perspective-1000 w-16 h-24 sm:w-24 sm:h-32"}>
                    <div
                      className={cn(
                        `relative w-full h-full transition-transform duration-700 preserve-3d `,
                        {
                          "rotate-y-180": isRevealed,
                        },
                      )}
                    >
                      <div
                        className={`absolute inset-0 backface-hidden rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg transition-all
                        ${hasVoted ? "bg-primary border-primary text-white scale-105" : "border-primary text-primary"}
                      `}
                      >
                        {roomData?.groups &&
                          roomData.groups.length > 0 &&
                          data.group &&
                          roomData.groups.includes(data.group) && (
                            <Chip
                              size="sm"
                              variant="solid"
                              color="primary"
                              className={cn(
                                "absolute top-2  text-white rounded-full",
                                {
                                  "opacity-0": !data.group,
                                },
                              )}
                            >
                              <div className="max-w-14 truncate">
                                {data.group}
                              </div>
                            </Chip>
                          )}
                        {hasVoted ? (
                          <span className="font-black sm:text-[20px] italic">
                            READY
                          </span>
                        ) : (
                          <IoHelpOutline size={32} />
                        )}
                      </div>
                      <Card className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-4 border-primary flex items-center justify-center shadow-xl bg-primary">
                        {roomData?.groups &&
                          roomData.groups.length > 0 &&
                          data.group &&
                          roomData.groups.includes(data.group) && (
                            <Chip
                              size="sm"
                              variant="solid"
                              color="primary"
                              className={cn(
                                "absolute top-2  text-white rounded-full",
                                {
                                  "opacity-0": !data.group,
                                },
                              )}
                            >
                              <div className="max-w-14 truncate">
                                {data.group}
                              </div>
                            </Chip>
                          )}
                        <div
                          className={cn({
                            "w-5 aspect-square rounded-full bg-white overflow-hidden":
                              !isRevealed,
                          })}
                        >
                          <div
                            className={cn(
                              "text-white text-3xl max-w-20 truncate font-black",
                              {
                                hidden: !isRevealed,
                                "text-2xl": String(data.score).length > 3,
                                "text-xl": String(data.score).length > 4,
                                "text-medium": String(data.score).length > 5,
                              },
                            )}
                          >
                            {(isRevealed ? data.score : "ไม่บอกหรอก!") || "☕"}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                  <div
                    className={`flex sm:max-w-24 max-w-16 items-center gap-1 group rounded-lg px-2 py-1 ${isMe ? "bg-primary text-white cursor-pointer" : "bg-default-100 text-default-600"}`}
                    onClick={() => {
                      if (!isMe) return;
                      setTempName(userName);
                      setTempGroup(userGroup);
                      onRenameOpen();
                    }}
                  >
                    <span
                      className={`text-[12px] flex-1 font-black transition-colors truncate`}
                    >
                      {data.name.toUpperCase()}
                    </span>
                    {isMe && <IoPencil size={12} />}
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* 4. Card Selection & Settings Button */}
      <div className="sticky bottom-6 z-50">
        <Card
          isBlurred
          className="px-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-sm"
        >
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            <Button
              isIconOnly
              variant="flat"
              color="primary"
              onPress={onOpen}
              className="min-w-[48px] h-12 rounded-xl shadow-sm"
            >
              <IoSettingsOutline size={20} />
            </Button>
            <Divider orientation="vertical" className="h-8" />
            <div className="flex gap-3 py-4 flex-1 justify-center">
              {activeDeck.map((val) => {
                const isSelected = roomData?.votes[userId]?.score === val;
                return (
                  <Button
                    key={val}
                    variant={isSelected ? "solid" : "flat"}
                    color={isSelected ? "primary" : "default"}
                    className={`min-w-[56px] h-16 text-xl font-black rounded-2xl transition-all
                      ${isSelected ? "-translate-y-4 shadow-xl scale-110" : "hover:-translate-y-2"}
                    `}
                    onPress={() => handleVote(val)}
                  >
                    {val === "☕" ? <IoCafeOutline size={24} /> : val}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Deck Settings Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Deck Settings</ModalHeader>
              <ModalBody>
                <Tabs
                  fullWidth
                  selectedKey={tempDeckInput}
                  onSelectionChange={(key) => setTempDeckInput(key as DeckType)}
                >
                  <Tab key="fibonacci" title="Fibonacci" />
                  <Tab key="tshirt" title="T-Shirt" />
                  <Tab key="custom" title="Custom" />
                </Tabs>
                <Input
                  label="Values"
                  placeholder="e.g. 1, 2, 3, 5"
                  variant="bordered"
                  value={
                    tempDeckInput === "custom"
                      ? customDeckInput
                      : DECKS[tempDeckInput as DeckType].join(", ")
                  }
                  disabled={tempDeckInput !== "custom"}
                  onChange={(e) => setCustomDeckInput(e.target.value)}
                  className="mt-4"
                />
              </ModalBody>
              <ModalHeader>Group Settings</ModalHeader>
              <ModalBody>
                <Input
                  label="Groups"
                  placeholder="e.g. Group 1, Group 2, Group 3"
                  variant="bordered"
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    updateDeckSettings(
                      tempDeckInput || "fibonacci",
                      customDeckInput,
                    );
                    updateGroupSettings(groupInput);
                    onClose();
                  }}
                >
                  Save Deck
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 6. Rename User Modal */}
      <Modal
        isOpen={isRenameOpen}
        onOpenChange={onRenameOpenChange}
        backdrop="blur"
        size="xs"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Change Your Name</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="New Name"
                  variant="bordered"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateVoterData();
                      onClose();
                    }
                  }}
                />
              </ModalBody>
              {roomData?.groups && roomData?.groups.length > 0 && (
                <>
                  <ModalHeader>Change Your Group</ModalHeader>
                  <ModalBody>
                    <div className="flex flex-wrap gap-2">
                      {roomData?.groups?.map((group) => (
                        <Chip
                          key={group}
                          variant={tempGroup === group ? "solid" : "bordered"}
                          color="primary"
                          onClick={() =>
                            group == tempGroup
                              ? setTempGroup("")
                              : setTempGroup(group)
                          }
                          className="cursor-pointer select-none"
                        >
                          {group}
                        </Chip>
                      ))}
                    </div>
                  </ModalBody>
                </>
              )}
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleUpdateVoterData();
                    onClose();
                  }}
                >
                  Update
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PlanningPoker;
