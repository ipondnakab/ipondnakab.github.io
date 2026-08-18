"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { IoWarningOutline } from "react-icons/io5";

export interface PlanningPokerConfirmKickModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  voterName?: string;
  onConfirm: () => void;
}

const PlanningPokerConfirmKickModal: React.FC<
  PlanningPokerConfirmKickModalProps
> = ({ isOpen, onOpenChange, voterName, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="xs"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 text-danger">
              <IoWarningOutline size={22} />
              {t("poker.removePlayerHeader")}
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-600">
                {t("poker.removeConfirm", {
                  name: voterName || t("poker.thisPlayer"),
                })}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                {t("poker.cancel")}
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {t("poker.remove")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PlanningPokerConfirmKickModal;
