"use client";

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
import { useTranslation } from "react-i18next";

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
            <ModalHeader>
              {isEditingOther
                ? t("poker.editPlayerName")
                : t("poker.changeYourName")}
            </ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label={t("poker.newName")}
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
                  {isEditingOther
                    ? t("poker.editPlayerGroup")
                    : t("poker.changeYourGroup")}
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
                {t("poker.cancel")}
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleUpdateVoterData();
                  onClose();
                }}
              >
                {t("poker.update")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PlanningPokerSettingUserModal;
