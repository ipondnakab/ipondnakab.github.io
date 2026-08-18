"use client";

import { PLANNING_POKER_NOTE_MAX_LENGTH } from "@/features/planning-poker/constants";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

export interface PlanningPokerNoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // Timestamp of the round being annotated, shown so the dialog says which
  // round it belongs to once the history list is behind it. Omitted when the
  // note is for the round in play, which needs no disambiguation.
  roundLabel?: string;
  // The draft is owned by the caller, matching PlanningPokerSettingUserModal.
  value: string;
  onValueChange: (value: string) => void;
  onSave: () => void;
}

const PlanningPokerNoteModal: React.FC<PlanningPokerNoteModalProps> = ({
  isOpen,
  onOpenChange,
  roundLabel,
  value,
  onValueChange,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="sm"
      placement="center"
    >
      <ModalContent>
        {(onClose) => {
          const save = () => {
            onSave();
            onClose();
          };
          return (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("poker.historyNote")}
                {roundLabel && (
                  <span className="text-tiny font-normal text-default-400">
                    {roundLabel}
                  </span>
                )}
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  variant="bordered"
                  value={value}
                  maxLength={PLANNING_POKER_NOTE_MAX_LENGTH}
                  aria-label={t("poker.historyNote")}
                  placeholder={t("poker.historyNotePlaceholder")}
                  description={`${value.length}/${PLANNING_POKER_NOTE_MAX_LENGTH}`}
                  onChange={(e) => onValueChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save();
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  {t("poker.cancel")}
                </Button>
                <Button color="primary" onPress={save}>
                  {t("poker.save")}
                </Button>
              </ModalFooter>
            </>
          );
        }}
      </ModalContent>
    </Modal>
  );
};

export default PlanningPokerNoteModal;
