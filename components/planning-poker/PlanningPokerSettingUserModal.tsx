import { RoomData } from "@/interfaces/poker";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

export interface PlanningPokerSettingUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tempName: string;
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  tempGroup: string;
  setTempGroup: React.Dispatch<React.SetStateAction<string>>;
  roomData: RoomData | null;
  handleUpdateVoterData: () => void;
}

const PlanningPokerSettingUserModal: React.FC<
  PlanningPokerSettingUserModalProps
> = ({
  isOpen,
  onOpenChange,
  tempName,
  setTempName,
  tempGroup,
  setTempGroup,
  roomData,
  handleUpdateVoterData,
}) => {
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
            <ModalHeader>Change Your Name</ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="New Name"
                variant="bordered"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateVoterData();
                    onClose();
                  }
                }}
              />
            </ModalBody>
            {roomData?.groups && roomData?.groups.length > 0 && (
              <>
                <ModalHeader>Change Your Group</ModalHeader>
                <ModalBody>
                  <div className="flex flex-wrap gap-2">
                    {roomData?.groups?.map((group) => (
                      <Chip
                        key={group}
                        variant={tempGroup === group ? "solid" : "bordered"}
                        color="primary"
                        onClick={() =>
                          group === tempGroup
                            ? setTempGroup("")
                            : setTempGroup(group)
                        }
                        className="cursor-pointer select-none"
                      >
                        {group}
                      </Chip>
                    ))}
                  </div>
                </ModalBody>
              </>
            )}
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleUpdateVoterData();
                  onClose();
                }}
              >
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PlanningPokerSettingUserModal;
