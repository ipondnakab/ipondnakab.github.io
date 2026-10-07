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

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onClose,
  onConfirm,
  children,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    placement="center"
    size="md"
    scrollBehavior="inside"
    backdrop="blur"
    disableAnimation
    hideCloseButton
    classNames={{
      base: "mx-3 max-w-md rounded-3xl bg-content1 text-foreground",
    }}
  >
    <ModalContent>
      <ModalHeader className="pr-6 text-xl">{title}</ModalHeader>
      <ModalBody className="gap-4">
        <p className="text-sm leading-relaxed text-default-600">
          {description}
        </p>
        {children}
      </ModalBody>
      <ModalFooter className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          autoFocus
          variant="flat"
          radius="lg"
          disableAnimation
          onPress={onClose}
          className="min-h-12 min-w-0 whitespace-normal font-semibold"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          color="danger"
          radius="lg"
          disableAnimation
          onPress={onConfirm}
          className="min-h-12 min-w-0 whitespace-normal font-semibold"
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default ConfirmModal;
