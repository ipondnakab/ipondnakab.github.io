"use client";

import { Button, Card } from "@nextui-org/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoPencilOutline } from "react-icons/io5";

import PlanningPokerNoteModal from "./PlanningPokerNoteModal";

export interface PlanningPokerRoundNoteProps {
  note?: string;
  // Passing an empty note clears it.
  onUpdateNote: (note: string) => void;
}

const PlanningPokerRoundNote: React.FC<PlanningPokerRoundNoteProps> = ({
  note,
  onUpdateNote,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEditing = () => {
    // Seed from the live note each time, so a discarded draft never lingers.
    setDraft(note ?? "");
    setIsEditing(true);
  };

  return (
    <>
      <Card
        isBlurred
        className="flex flex-row max-w-full items-center gap-3 px-4 py-2 rounded-3xl shadow-sm"
      >
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-default-400">
          {t("poker.roundNote")}
        </span>
        <span
          className={`flex-1 truncate text-sm ${
            note ? "font-semibold" : "text-default-400"
          }`}
        >
          {note || t("poker.roundNoteEmpty")}
        </span>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label={
            note ? t("poker.historyEditNote") : t("poker.historyAddNote")
          }
          onPress={startEditing}
        >
          <IoPencilOutline />
        </Button>
      </Card>
      <PlanningPokerNoteModal
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        value={draft}
        onValueChange={setDraft}
        onSave={() => onUpdateNote(draft)}
      />
    </>
  );
};

export default PlanningPokerRoundNote;
