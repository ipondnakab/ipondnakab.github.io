import { DECKS, DeckType } from "@/interfaces/poker";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
} from "@nextui-org/react";

export interface PlanningPokerDeckSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tempDeckInput: DeckType;
  setTempDeckInput: React.Dispatch<React.SetStateAction<DeckType>>;
  customDeckInput: string;
  setCustomDeckInput: (input: string) => void;
  groupInput: string;
  setGroupInput: (input: string) => void;
  updateDeckSettings: (type: DeckType, customStr?: string) => Promise<void>;
  updateGroupSettings: (groups: string) => void;
}

const PlanningPokerDeckSettingsModal: React.FC<
  PlanningPokerDeckSettingsModalProps
> = ({
  isOpen,
  onOpenChange,
  tempDeckInput,
  setTempDeckInput,
  customDeckInput,
  setCustomDeckInput,
  groupInput,
  setGroupInput,
  updateDeckSettings,
  updateGroupSettings,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Deck Settings</ModalHeader>
            <ModalBody>
              <Tabs
                fullWidth
                selectedKey={tempDeckInput}
                onSelectionChange={(key) => setTempDeckInput(key as DeckType)}
              >
                <Tab key="fibonacci" title="Fibonacci" />
                <Tab key="tshirt" title="T-Shirt" />
                <Tab key="custom" title="Custom" />
              </Tabs>
              <Input
                label="Values"
                placeholder="e.g. 1, 2, 3, 5"
                variant="bordered"
                value={
                  tempDeckInput === "custom"
                    ? customDeckInput
                    : DECKS[tempDeckInput as DeckType].join(", ")
                }
                disabled={tempDeckInput !== "custom"}
                onChange={(e) => setCustomDeckInput(e.target.value)}
                className="mt-4"
              />
            </ModalBody>
            <ModalHeader>Group Settings</ModalHeader>
            <ModalBody>
              <Input
                label="Groups"
                placeholder="e.g. Group 1, Group 2, Group 3"
                variant="bordered"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  updateDeckSettings(
                    tempDeckInput || "fibonacci",
                    customDeckInput,
                  );
                  updateGroupSettings(groupInput);
                  onClose();
                }}
              >
                Save Deck
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PlanningPokerDeckSettingsModal;
