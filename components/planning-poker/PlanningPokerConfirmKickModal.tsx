import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
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
              Remove Player
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-600">
                Remove{" "}
                <span className="font-bold text-foreground">
                  {voterName || "this player"}
                </span>{" "}
                from the room? They will be sent back to the lobby and can
                rejoin at any time.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Remove
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PlanningPokerConfirmKickModal;
