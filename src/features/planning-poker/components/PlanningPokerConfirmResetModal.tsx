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

export interface PlanningPokerConfirmResetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const PlanningPokerConfirmResetModal: React.FC<
  PlanningPokerConfirmResetModalProps
> = ({ isOpen, onOpenChange, onConfirm }) => {
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
            <ModalHeader className="flex items-center gap-2 text-warning">
              <IoWarningOutline size={22} />
              {t("poker.resetConfirmHeader")}
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-600">
                {t("poker.resetConfirmBody")}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                {t("poker.cancel")}
              </Button>
              <Button
                color="warning"
                className="font-bold"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {t("poker.reset")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PlanningPokerConfirmResetModal;
