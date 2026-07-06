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
  isEditingOther?: boolean;
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
  isEditingOther = false,
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
            <ModalHeader>
              {isEditingOther ? "Edit Player Name" : "Change Your Name"}
            </ModalHeader>
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
            {roomData?.groupOptions && roomData?.groupOptions.length > 0 && (
              <>
                <ModalHeader>
                  {isEditingOther ? "Edit Player Group" : "Change Your Group"}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-wrap gap-2">
                    {roomData?.groupOptions?.map((group) => {
                      const isSelected = tempGroup === group.name;
                      return (
                        <Chip
                          key={group.name}
                          variant={isSelected ? "solid" : "bordered"}
                          style={
                            isSelected
                              ? { backgroundColor: group.color, color: "#fff" }
                              : { borderColor: group.color, color: group.color }
                          }
                          onClick={() =>
                            isSelected
                              ? setTempGroup("")
                              : setTempGroup(group.name)
                          }
                          className="cursor-pointer select-none"
                        >
                          {group.name}
                        </Chip>
                      );
                    })}
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
