"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoWarningOutline } from "react-icons/io5";

export interface PokdengResetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onResetCredits: () => void;
  onNewGame: () => void;
}

const PokdengResetModal: React.FC<PokdengResetModalProps> = ({
  isOpen,
  onOpenChange,
  onResetCredits,
  onNewGame,
}) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 text-warning">
              <IoWarningOutline size={22} />
              {t("pokdeng.resetTitle")}
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-600">
                {t("pokdeng.resetBody")}
              </p>
            </ModalBody>
            <ModalFooter className="flex-wrap">
              <Button variant="light" onPress={onClose}>
                {t("pokdeng.cancel")}
              </Button>
              <Button
                color="warning"
                className="font-bold"
                onPress={() => {
                  onResetCredits();
                  onClose();
                }}
              >
                {t("pokdeng.resetCredits")}
              </Button>
              <Button
                color="danger"
                className="font-bold"
                onPress={() => {
                  onNewGame();
                  onClose();
                }}
              >
                {t("pokdeng.newGame")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PokdengResetModal;
