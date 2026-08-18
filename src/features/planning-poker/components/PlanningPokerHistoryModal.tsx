"use client";

import { buildGroupAverages } from "@/functions/group-vote-averages";
import { DeckType, GroupObject, RoundHistoryEntry } from "@/interfaces/poker";
import {
  Accordion,
  AccordionItem,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IoPencilOutline,
  IoTimeOutline,
  IoTrashOutline,
} from "react-icons/io5";

import PlanningPokerNoteModal from "./PlanningPokerNoteModal";

export interface PlanningPokerHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  history: RoundHistoryEntry[];
  groupOptions: GroupObject[];
  isAdmin: boolean;
  onClearHistory: () => void;
  // Passing an empty note clears it.
  onUpdateNote: (entryId: string, note: string) => void;
}

const DECK_LABEL_KEY: Record<DeckType, string> = {
  fibonacci: "poker.deckFibonacci",
  tshirt: "poker.deckTshirt",
  custom: "poker.deckCustom",
};

const UNGROUPED_KEY = "__ungrouped";

// The accordion trigger is a react-aria pressable: it fires on pointerdown /
// pointerup rather than click, so stopping the click alone still lets a tap on
// the pen toggle the row. Every pointer phase has to be swallowed.
const stopEvent = (e: React.SyntheticEvent) => e.stopPropagation();

const stopTriggerPress = {
  onPointerDown: stopEvent,
  onPointerUp: stopEvent,
  onMouseDown: stopEvent,
  onMouseUp: stopEvent,
  onTouchStart: stopEvent,
  onTouchEnd: stopEvent,
};

const SECTION_LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-wider text-default-400";

const formatTime = (ms: number) =>
  new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const PlanningPokerHistoryModal: React.FC<PlanningPokerHistoryModalProps> = ({
  isOpen,
  onOpenChange,
  history,
  groupOptions,
  isAdmin,
  onClearHistory,
  onUpdateNote,
}) => {
  const { t } = useTranslation();
  const [confirmingClear, setConfirmingClear] = useState(false);
  // The round whose note is open in the editor dialog, plus its draft text.
  const [editingEntry, setEditingEntry] = useState<RoundHistoryEntry | null>(
    null,
  );
  const [noteDraft, setNoteDraft] = useState("");

  // Never carry the two-step clear confirmation or a half-typed note across
  // open/close.
  useEffect(() => {
    if (!isOpen) {
      setConfirmingClear(false);
      setEditingEntry(null);
      setNoteDraft("");
    }
  }, [isOpen]);

  const startEditingNote = (entry: RoundHistoryEntry) => {
    setEditingEntry(entry);
    setNoteDraft(entry.note ?? "");
  };

  const saveNote = () => {
    if (editingEntry) onUpdateNote(editingEntry.id, noteDraft);
  };

  const colorOf = (group?: string | null) =>
    group ? groupOptions.find((g) => g.name === group)?.color : undefined;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="2xl"
        scrollBehavior="inside"
        // Not dismissable on outside press, because the note dialog stacks on
        // top of this one: closing that dialog removes it from react-aria's
        // overlay stack mid-gesture, and the tail of the very click that
        // dismissed it then reads as an interaction outside *this* modal —
        // taking the history down with it. Escape and Close still work.
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <IoTimeOutline size={22} />
                {t("poker.historyTitle")}
              </ModalHeader>
              <ModalBody className="gap-3 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-6">
                    {t("poker.historyEmpty")}
                  </p>
                ) : (
                  <Accordion
                    variant="splitted"
                    selectionMode="multiple"
                    // Only the newest round starts open — the rest stay collapsed
                    // so a full 20-round history is scannable at a glance.
                    defaultExpandedKeys={[history[0].id]}
                    className="px-0"
                    itemClasses={{
                      // `shrink-0` is load-bearing: ModalBody is a `flex flex-1
                      // flex-col` box, so without it a long history squashes
                      // every row to a clipped sliver instead of overflowing and
                      // showing the `scrollBehavior="inside"` scrollbar.
                      base: "shrink-0 px-3 shadow-sm",
                      trigger: "py-3",
                      titleWrapper: "gap-0.5 max-w-[calc(100%-2rem)]",
                      content: "pt-0 pb-3",
                    }}
                  >
                    {history.map((entry) => {
                      const groupAverages = buildGroupAverages(entry.votes);
                      return (
                        <AccordionItem
                          key={entry.id}
                          aria-label={`${t("poker.historyTitle")} ${formatTime(
                            entry.endedAt,
                          )}`}
                          // NextUI renders `title`/`subtitle` inside a <span>,
                          // so this subtree stays phrasing content — hence the
                          // spans and `as="span"` on the Chip.
                          title={
                            <span className="flex w-full items-center justify-between gap-2">
                              <span className="flex min-w-0 items-center gap-1">
                                <span className="shrink-0 text-sm font-semibold text-default-600">
                                  {formatTime(entry.endedAt)}
                                </span>
                                {/* Below `sm` the title row can't fit the note
                                    next to the time, the pen and the average
                                    without squeezing them all — there it moves
                                    down into the panel instead. */}
                                {entry.note && (
                                  <Chip
                                    as="span"
                                    size="sm"
                                    variant="flat"
                                    className="hidden min-w-0 sm:inline-flex"
                                    classNames={{ content: "truncate" }}
                                  >
                                    {entry.note}
                                  </Chip>
                                )}
                                {/* A <span role="button"> rather than a real
                                  <button>: this sits inside the accordion
                                  trigger, which is itself a button, and
                                  nesting one would be invalid markup. Below
                                  `sm` it gives way to a proper Button in the
                                  panel, alongside the note. */}
                                <span
                                  role="button"
                                  tabIndex={0}
                                  aria-label={
                                    entry.note
                                      ? t("poker.historyEditNote")
                                      : t("poker.historyAddNote")
                                  }
                                  className="hidden shrink-0 rounded-full p-1 text-default-400 transition-colors hover:bg-default-200 hover:text-default-600 sm:inline-flex"
                                  {...stopTriggerPress}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingNote(entry);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ")
                                      return;
                                    e.preventDefault();
                                    e.stopPropagation();
                                    startEditingNote(entry);
                                  }}
                                >
                                  <IoPencilOutline />
                                </span>
                              </span>
                              <Chip
                                as="span"
                                size="sm"
                                color="primary"
                                variant="flat"
                                className="shrink-0 font-bold"
                              >
                                {t("poker.average")}: {entry.avg}
                              </Chip>
                            </span>
                          }
                          subtitle={
                            <span className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-default-400">
                              <span>
                                {t("poker.votes")}: {entry.total} /{" "}
                                {entry.playerCount}
                              </span>
                              <span>
                                {t("poker.historyDeck")}:{" "}
                                {t(
                                  DECK_LABEL_KEY[entry.deckType] ??
                                    "poker.deckFibonacci",
                                )}
                              </span>
                            </span>
                          }
                        >
                          <div className="flex flex-col gap-3">
                            {/* The phone-sized home for the note and its pen —
                                hidden from `sm` up, where both ride in the
                                title instead. Out here the pen is a real
                                Button: nothing wraps it in another one. */}
                            <div
                              className="flex sm:hidden min-w-0 flex-1 flex-col gap-1.5"
                              onClick={() => startEditingNote(entry)}
                            >
                              <div>
                                <span className={SECTION_LABEL_CLASS}>
                                  {t("poker.historyNote")}
                                </span>
                              </div>

                              <div
                                className={`truncate flex items-center gap-1 text-sm ${
                                  entry.note
                                    ? "font-semibold"
                                    : "text-default-400"
                                }`}
                              >
                                <span>
                                  {entry.note || t("poker.historyAddNote")}{" "}
                                </span>
                                <IoPencilOutline size={10} />
                              </div>
                            </div>
                            {/* A single bucket would just restate the round
                              average, so the breakdown only earns its space
                              once the votes actually span groups. */}
                            {groupAverages.length > 1 && (
                              <div className="flex flex-col gap-1.5">
                                <span className={SECTION_LABEL_CLASS}>
                                  {t("poker.historyByGroup")}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {groupAverages.map((groupAverage) => {
                                    const color = colorOf(groupAverage.group);
                                    return (
                                      <div
                                        key={
                                          groupAverage.group ?? UNGROUPED_KEY
                                        }
                                        className="flex items-center gap-1.5 rounded-medium bg-default-100 px-2 py-1"
                                      >
                                        {color && (
                                          <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: color }}
                                          />
                                        )}
                                        <span className="text-[11px] text-default-500">
                                          {groupAverage.group ??
                                            t("poker.historyNoGroup")}
                                        </span>
                                        <span className="text-xs font-bold">
                                          {groupAverage.avg}
                                        </span>
                                        <span className="text-[10px] text-default-400">
                                          {groupAverage.total}/
                                          {groupAverage.playerCount}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                              <span className={SECTION_LABEL_CLASS}>
                                {t("poker.historyPlayerVotes")}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {entry.votes.map((vote, index) => {
                                  const color = colorOf(vote.group);
                                  return (
                                    <Chip
                                      key={`${entry.id}-${index}`}
                                      size="sm"
                                      variant="flat"
                                      startContent={
                                        color ? (
                                          <Tooltip
                                            content={vote.group}
                                            size="sm"
                                            placement="top"
                                          >
                                            <span
                                              tabIndex={0}
                                              aria-label={
                                                vote.group ?? undefined
                                              }
                                              className="ml-1 h-2 w-2 cursor-pointer rounded-full"
                                              style={{ backgroundColor: color }}
                                            />
                                          </Tooltip>
                                        ) : undefined
                                      }
                                    >
                                      <span className="text-default-500">
                                        {vote.name}
                                      </span>
                                      <span className="ml-1 font-bold">
                                        {vote.score ?? "—"}
                                      </span>
                                    </Chip>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </ModalBody>
              <ModalFooter className="justify-between">
                {isAdmin && history.length > 0 ? (
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    startContent={<IoTrashOutline />}
                    onPress={() => {
                      if (confirmingClear) {
                        onClearHistory();
                        setConfirmingClear(false);
                      } else {
                        setConfirmingClear(true);
                      }
                    }}
                  >
                    {confirmingClear
                      ? t("poker.clearHistoryConfirm")
                      : t("poker.clearHistory")}
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  variant="light"
                  onPress={() => {
                    setConfirmingClear(false);
                    onClose();
                  }}
                >
                  {t("poker.close")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Stacked on top of the history list rather than nested in a row, so a
        long history never scrolls the field being typed into out of view. */}
      <PlanningPokerNoteModal
        isOpen={editingEntry !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEntry(null);
        }}
        roundLabel={editingEntry ? formatTime(editingEntry.endedAt) : ""}
        value={noteDraft}
        onValueChange={setNoteDraft}
        onSave={saveNote}
      />
    </>
  );
};

export default PlanningPokerHistoryModal;
