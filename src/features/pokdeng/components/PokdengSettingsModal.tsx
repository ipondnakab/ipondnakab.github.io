"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  POKDENG_MAX_BET,
  POKDENG_MIN_BET,
  POKDENG_NAME_MAX_LENGTH,
} from "@/features/pokdeng/constants";

export interface PokdengSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hostName: string;
  bet: number;
  onSave: (hostName: string, bet: number) => void;
}

const PokdengSettingsModal: React.FC<PokdengSettingsModalProps> = ({
  isOpen,
  onOpenChange,
  hostName,
  bet,
  onSave,
}) => {
  const { t } = useTranslation();
  const [nameInput, setNameInput] = useState<string>(hostName);
  const [betInput, setBetInput] = useState<string>(String(bet));

  // Seed the drafts from the live game each time the modal opens, so a
  // cancelled edit leaves no residue behind.
  useEffect(() => {
    if (!isOpen) return;
    setNameInput(hostName);
    setBetInput(String(bet));
  }, [isOpen, hostName, bet]);

  const parsedBet = Number(betInput);
  const isBetValid =
    Number.isFinite(parsedBet) &&
    parsedBet >= POKDENG_MIN_BET &&
    parsedBet <= POKDENG_MAX_BET;
  const canSave = nameInput.trim() !== "" && isBetValid;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{t("pokdeng.settings")}</ModalHeader>
            <ModalBody className="gap-4">
              <Input
                variant="bordered"
                label={t("pokdeng.hostName")}
                value={nameInput}
                maxLength={POKDENG_NAME_MAX_LENGTH}
                onValueChange={setNameInput}
              />
              <Input
                type="number"
                inputMode="numeric"
                variant="bordered"
                label={t("pokdeng.baseBet")}
                description={t("pokdeng.baseBetChangeHint")}
                value={betInput}
                min={POKDENG_MIN_BET}
                max={POKDENG_MAX_BET}
                isInvalid={betInput !== "" && !isBetValid}
                errorMessage={
                  betInput !== "" && !isBetValid
                    ? t("pokdeng.baseBetInvalid", {
                        min: POKDENG_MIN_BET,
                        max: POKDENG_MAX_BET,
                      })
                    : undefined
                }
                onValueChange={setBetInput}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                {t("pokdeng.cancel")}
              </Button>
              <Button
                color="primary"
                className="font-bold"
                isDisabled={!canSave}
                onPress={() => {
                  onSave(nameInput.trim(), parsedBet);
                  onClose();
                }}
              >
                {t("pokdeng.save")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PokdengSettingsModal;
