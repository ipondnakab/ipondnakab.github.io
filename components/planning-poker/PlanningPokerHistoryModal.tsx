"use client";

import { DeckType, GroupObject, RoundHistoryEntry } from "@/interfaces/poker";
import {
  Button,
  Card,
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
import { IoTimeOutline, IoTrashOutline } from "react-icons/io5";

export interface PlanningPokerHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  history: RoundHistoryEntry[];
  groupOptions: GroupObject[];
  isAdmin: boolean;
  onClearHistory: () => void;
}

const DECK_LABEL_KEY: Record<DeckType, string> = {
  fibonacci: "poker.deckFibonacci",
  tshirt: "poker.deckTshirt",
  custom: "poker.deckCustom",
};

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
}) => {
  const { t } = useTranslation();
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Never carry the two-step clear confirmation across open/close.
  useEffect(() => {
    if (!isOpen) setConfirmingClear(false);
  }, [isOpen]);

  const colorOf = (group?: string | null) =>
    group ? groupOptions.find((g) => g.name === group)?.color : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <IoTimeOutline size={22} />
              {t("poker.historyTitle")}
            </ModalHeader>
            <ModalBody className="gap-3">
              {history.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-6">
                  {t("poker.historyEmpty")}
                </p>
              ) : (
                history.map((entry) => (
                  <Card
                    key={entry.id}
                    isBlurred
                    className="gap-2 p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-default-600">
                        {formatTime(entry.endedAt)}
                      </span>
                      <Chip
                        size="sm"
                        color="primary"
                        variant="flat"
                        className="font-bold"
                      >
                        {t("poker.average")}: {entry.avg}
                      </Chip>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-default-400">
                      <span>
                        {t("poker.votes")}: {entry.total} / {entry.playerCount}
                      </span>
                      <span>
                        {t("poker.historyDeck")}:{" "}
                        {t(
                          DECK_LABEL_KEY[entry.deckType] ??
                            "poker.deckFibonacci",
                        )}
                      </span>
                    </div>
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
                                    aria-label={vote.group ?? undefined}
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
                  </Card>
                ))
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
  );
};

export default PlanningPokerHistoryModal;
