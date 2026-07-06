"use client";

import {
  DECKS,
  DEFAULT_GROUP_COLOR,
  DeckType,
  GROUP_COLOR_OPTIONS,
  GroupObject,
} from "@/interfaces/poker";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { IoAdd, IoTrashOutline } from "react-icons/io5";

export interface PlanningPokerDeckSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tempDeckInput: DeckType;
  setTempDeckInput: React.Dispatch<React.SetStateAction<DeckType>>;
  customDeckInput: string;
  setCustomDeckInput: (input: string) => void;
  groupOptionsInput: GroupObject[];
  setGroupOptionsInput: (groups: GroupObject[]) => void;
  sortByGroupInput: boolean;
  setSortByGroupInput: (value: boolean) => void;
  updateDeckSettings: (type: DeckType, customStr?: string) => Promise<void>;
  updateGroupSettings: (groups: GroupObject[]) => void;
  updateSortByGroup: (value: boolean) => void;
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
  groupOptionsInput,
  setGroupOptionsInput,
  sortByGroupInput,
  setSortByGroupInput,
  updateDeckSettings,
  updateGroupSettings,
  updateSortByGroup,
}) => {
  const { t } = useTranslation();
  const handleAddGroup = () => {
    const color =
      GROUP_COLOR_OPTIONS[groupOptionsInput.length % GROUP_COLOR_OPTIONS.length]
        ?.value ?? DEFAULT_GROUP_COLOR;
    setGroupOptionsInput([...groupOptionsInput, { name: "", color }]);
  };

  const handleRemoveGroup = (index: number) => {
    setGroupOptionsInput(groupOptionsInput.filter((_, i) => i !== index));
  };

  const handleChangeGroupName = (index: number, name: string) => {
    setGroupOptionsInput(
      groupOptionsInput.map((g, i) => (i === index ? { ...g, name } : g)),
    );
  };

  const handleChangeGroupColor = (index: number, color: string) => {
    setGroupOptionsInput(
      groupOptionsInput.map((g, i) => (i === index ? { ...g, color } : g)),
    );
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{t("poker.deckSettings")}</ModalHeader>
            <ModalBody>
              <Tabs
                fullWidth
                selectedKey={tempDeckInput}
                onSelectionChange={(key) => setTempDeckInput(key as DeckType)}
              >
                <Tab key="fibonacci" title={t("poker.deckFibonacci")} />
                <Tab key="tshirt" title={t("poker.deckTshirt")} />
                <Tab key="custom" title={t("poker.deckCustom")} />
              </Tabs>
              <Input
                label={t("poker.deckValues")}
                placeholder={t("poker.deckValuesPlaceholder")}
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
            <ModalHeader className="justify-between items-center">
              <span>{t("poker.groupSettingsTitle")}</span>
              <div className="flex items-center gap-4 text-xs text-foreground/70 font-light mr-4">
                <Checkbox
                  size="sm"
                  isSelected={sortByGroupInput}
                  onValueChange={setSortByGroupInput}
                >
                  {t("poker.sortingByGroup")}
                </Checkbox>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                {groupOptionsInput.map((group, index) => (
                  <div key={index} className="flex flex-row items-center gap-2">
                    <Input
                      size="sm"
                      variant="bordered"
                      aria-label={t("poker.groupNameAria", {
                        index: index + 1,
                      })}
                      placeholder={t("poker.groupNamePlaceholder", {
                        index: index + 1,
                      })}
                      value={group.name}
                      onChange={(e) =>
                        handleChangeGroupName(index, e.target.value)
                      }
                    />
                    <Select
                      size="sm"
                      variant="bordered"
                      aria-label={t("poker.groupColorAria", {
                        index: index + 1,
                      })}
                      className="max-w-[9rem]"
                      disallowEmptySelection
                      selectedKeys={[group.color]}
                      onChange={(e) =>
                        e.target.value &&
                        handleChangeGroupColor(index, e.target.value)
                      }
                      renderValue={(items) =>
                        items.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: String(item.key) }}
                            />
                            {item.textValue}
                          </div>
                        ))
                      }
                    >
                      {GROUP_COLOR_OPTIONS.map((c) => (
                        <SelectItem key={c.value} textValue={c.label}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: c.value }}
                            />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      aria-label={t("poker.removeGroupAria", {
                        index: index + 1,
                      })}
                      onPress={() => handleRemoveGroup(index)}
                    >
                      <IoTrashOutline size={18} />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<IoAdd size={18} />}
                  onPress={handleAddGroup}
                >
                  {t("poker.addGroup")}
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                {t("poker.close")}
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  updateDeckSettings(
                    tempDeckInput || "fibonacci",
                    customDeckInput,
                  );
                  updateGroupSettings(groupOptionsInput);
                  updateSortByGroup(sortByGroupInput);
                  onClose();
                }}
              >
                {t("poker.saveDeck")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PlanningPokerDeckSettingsModal;
