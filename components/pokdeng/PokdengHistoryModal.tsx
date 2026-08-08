"use client";

import {
  Button,
  Card,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  cn,
} from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoArrowUndo } from "react-icons/io5";

import { formatPokdengCredit } from "@/functions/pokdeng-credit";
import { PokdengTurn } from "@/interfaces/pokdeng";

const SECTION_LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-wider text-default-400";

const formatTime = (ms: number) =>
  new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export interface PokdengHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  turns: PokdengTurn[];
  hostName: string;
  onUndo: () => void;
}

const PokdengHistoryModal: React.FC<PokdengHistoryModalProps> = ({
  isOpen,
  onOpenChange,
  turns,
  hostName,
  onUndo,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{t("pokdeng.historyTitle")}</ModalHeader>
            <ModalBody className="gap-3">
              {turns.length === 0 ? (
                <p className="py-6 text-center text-sm text-default-500">
                  {t("pokdeng.historyEmpty")}
                </p>
              ) : (
                turns.map((turn) => (
                  <Card
                    key={turn.id}
                    className="gap-2 p-3 shadow-none"
                    isBlurred
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Chip size="sm" variant="flat" color="primary">
                          <span className="font-bold tabular-nums">
                            {t("pokdeng.turnNumber", { num: turn.index })}
                          </span>
                        </Chip>
                        <span className="text-[11px] text-default-400">
                          {formatTime(turn.endedAt)}
                        </span>
                        <span className="text-[11px] text-default-400">
                          {t("pokdeng.betChip", {
                            bet: turn.bet.toLocaleString(),
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={SECTION_LABEL_CLASS}>{hostName}</span>
                        <span
                          className={cn("text-sm font-black tabular-nums", {
                            "text-success": turn.hostAmount > 0,
                            "text-danger": turn.hostAmount < 0,
                            "text-default-400": turn.hostAmount === 0,
                          })}
                        >
                          {formatPokdengCredit(turn.hostAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {turn.results.map((result) => (
                        <Chip
                          key={result.playerId}
                          size="sm"
                          variant="flat"
                          color={
                            result.outcome === "win" ? "success" : "danger"
                          }
                          className="tabular-nums"
                        >
                          <span className="font-semibold">{result.name}</span>{" "}
                          {formatPokdengCredit(result.amount)}
                          {result.multiplier > 1
                            ? ` (x${result.multiplier})`
                            : ""}
                        </Chip>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </ModalBody>
            <ModalFooter>
              {/* Undo pops the newest turn off the balances — the fix for a
                  misclick, so it lives next to the log that shows it. */}
              <Button
                variant="flat"
                color="warning"
                isDisabled={turns.length === 0}
                startContent={<IoArrowUndo />}
                onPress={onUndo}
              >
                {t("pokdeng.undoLast")}
              </Button>
              <Button color="primary" onPress={onClose}>
                {t("pokdeng.close")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PokdengHistoryModal;
