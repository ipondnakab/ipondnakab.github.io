"use client";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/libs/firebase";
import {
  doc,
  onSnapshot,
  setDoc,
  DocumentReference,
  deleteField,
} from "firebase/firestore";
import { RoomData, DECKS } from "@/interfaces/poker";
import { PLANNING_POKER_DB_NAME } from "@/constants/database-name";

import {
  Card,
  Chip,
  Button,
  Input,
  Tabs,
  Tab,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import {
  IoPeople,
  IoEye,
  IoEyeOff,
  IoRefresh,
  IoCafeOutline,
  IoHelpOutline,
  IoSettingsOutline,
  IoPencil,
} from "react-icons/io5";

export default function PlanningPoker() {
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
  const [tempName, setTempName] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [customDeckInput, setCustomDeckInput] = useState("");

  const activeDeck = useMemo(() => {
    if (!roomData) return DECKS.fibonacci;
    if (roomData.deckType === "custom" && roomData.customDeck) {
      return roomData.customDeck;
    }
    return DECKS[roomData.deckType as keyof typeof DECKS] || DECKS.fibonacci;
  }, [roomData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("room");
    if (id) setRoomId(id);
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
        if (data.customDeck) setCustomDeckInput(data.customDeck.join(", "));
        if (data.votes[userId]) setUserName(data.votes[userId].name);
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
    const scores = Object.values(roomData.votes)
      .map((v) => v.score)
      .filter((s): s is string => s !== null && !isNaN(Number(s)))
      .map(Number);
    if (scores.length === 0) return { avg: "-", total: 0 };
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { avg: avg.toFixed(1), total: scores.length };
  }, [roomData]);

  const handleJoin = async () => {
    if (!roomId || !userName) return;
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      { votes: { [userId]: { name: userName, score: null } } },
      { merge: true },
    );
    setIsJoined(true);
  };

  const handleRename = async () => {
    if (!roomId || !tempName.trim()) return;
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId),
      {
        votes: { [userId]: { name: tempName.trim() } },
      },
      { merge: true },
    );
    setUserName(tempName.trim());
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
    const resetVotes: any = {};
    Object.keys(roomData!.votes).forEach((id) => {
      resetVotes[id] = { ...roomData!.votes[id], score: null };
    });
    await setDoc(
      doc(db, PLANNING_POKER_DB_NAME, roomId!),
      { revealed: false, votes: resetVotes },
      { merge: true },
    );
  };

  const updateDeckSettings = async (type: string, customStr?: string) => {
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

  if (!roomId || !isJoined) {
    return (
      <div className=" flex items-center justify-center p-8 py-16 h-[calc(100vh-4rem)]">
        {!roomId ? (
          <Card isBlurred className="max-w-sm w-full p-8 gap-4 shadow-xl">
            <h2 className="text-xl font-bold self-center">
              Welcome to Planning Poker
            </h2>

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
          <Chip
            size="sm"
            variant="dot"
            color="success"
            className="hidden sm:flex capitalize"
          >
            {roomData?.deckType || "Fibonacci"}
          </Chip>
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
        className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-none shadow-sm bg-white/50"
      >
        <div className="flex flex-col items-center border-r border-default-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">
            Average
          </span>
          <span className="text-2xl font-black text-primary">
            {roomData?.revealed ? stats?.avg : "?"}
          </span>
        </div>
        <div className="flex flex-col items-center md:border-r border-default-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">
            Votes
          </span>
          <span className="text-2xl font-black">{stats?.total}</span>
        </div>
        <div className="flex flex-col items-center border-r border-default-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">
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
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Room ID
          </span>
          <span className="text-sm font-bold mt-1 uppercase">{roomId}</span>
        </div>
      </Card>

      {/* 3. Main Card Table */}
      <Card
        isBlurred
        className="flex-1 min-h-[360px] p-4 flex items-center justify-center"
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
                  className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300"
                >
                  <div className="perspective-1000 w-16 h-24 sm:w-24 sm:h-32">
                    <div
                      className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isRevealed ? "rotate-y-180" : ""}`}
                    >
                      <div
                        className={`absolute inset-0 backface-hidden rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all
                        ${hasVoted ? "bg-primary border-primary text-white scale-105" : "border-primary text-primary"}
                      `}
                      >
                        {hasVoted ? (
                          <span className="font-black sm:text-[20px] italic">
                            READY
                          </span>
                        ) : (
                          <IoHelpOutline size={32} />
                        )}
                      </div>
                      <Card className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-4 border-primary flex items-center justify-center shadow-xl bg-primary">
                        <span className="text-3xl font-black">
                          {data.score || "☕"}
                        </span>
                      </Card>
                    </div>
                  </div>

                  {/* Name Label with Edit Icon */}
                  <div
                    className={`flex sm:max-w-24 max-w-16 items-center gap-1 group rounded-lg px-2 py-1 ${isMe ? "bg-primary text-white cursor-pointer" : "bg-default-100 text-default-600"}`}
                    onClick={() => {
                      if (!isMe) return;
                      setTempName(userName);
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
          className="shadow-2xl px-6 border-none bg-white/80 backdrop-blur-md rounded-3xl"
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
                  selectedKey={roomData?.deckType || "fibonacci"}
                  onSelectionChange={(key) => updateDeckSettings(key as string)}
                >
                  <Tab key="fibonacci" title="Fibonacci" />
                  <Tab key="tshirt" title="T-Shirt" />
                  <Tab key="custom" title="Custom" />
                </Tabs>
                {roomData?.deckType === "custom" && (
                  <Input
                    label="Values"
                    placeholder="e.g. 1, 2, 3, 5"
                    variant="bordered"
                    value={customDeckInput}
                    onChange={(e) => setCustomDeckInput(e.target.value)}
                    className="mt-4"
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    updateDeckSettings(
                      roomData?.deckType || "fibonacci",
                      customDeckInput,
                    );
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
                      handleRename();
                      onClose();
                    }
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleRename();
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
}
