"use client";

import { RoomData } from "@/features/planning-poker/model/poker";
import { Button, Card, Chip } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import {
  IoEye,
  IoEyeOff,
  IoPeople,
  IoRefresh,
  IoShieldCheckmark,
  IoTimeOutline,
} from "react-icons/io5";

// Below `sm` these collapse to their icon: the label is hidden and the button
// shrinks to a square, so the header row stops overflowing on a phone. The
// hidden label is why each one still carries an explicit aria-label.
const COMPACT_BUTTON_CLASS = "min-w-8 px-0 sm:min-w-16 sm:px-3";

export interface PlanningPokerHeaderProps {
  roomData: RoomData | null;
  isAdmin: boolean;
  historyCount: number;
  toggleReveal: () => void;
  resetRound: () => void;
  onOpenHistory: () => void;
}

const PlanningPokerHeader: React.FC<PlanningPokerHeaderProps> = ({
  roomData,
  isAdmin,
  historyCount,
  toggleReveal,
  resetRound,
  onOpenHistory,
}) => {
  const { t } = useTranslation();
  return (
    <Card
      isBlurred
      className="flex flex-row justify-between items-center p-4 rounded-3xl shadow-sm"
    >
      <div className="flex gap-2 items-center">
        <Chip
          size="lg"
          variant="flat"
          color="primary"
          startContent={<IoPeople className="ml-1" />}
        >
          <span className="inline sm:hidden">
            {Object.keys(roomData?.votes || {}).length}
          </span>
          <span className="hidden sm:inline">
            {t("poker.players", {
              num: Object.keys(roomData?.votes || {}).length,
            })}
          </span>
        </Chip>
        {isAdmin && (
          <Chip
            size="lg"
            variant="flat"
            color="warning"
            startContent={<IoShieldCheckmark className="ml-1" />}
          >
            {t("poker.admin")}
          </Chip>
        )}
        <span className="md:inline hidden text-[12px]">
          {t("poker.estimateTogether")}
        </span>
      </div>
      <div className="flex gap-1 sm:gap-2">
        <Button
          size="sm"
          variant="flat"
          className={COMPACT_BUTTON_CLASS}
          aria-label={t("poker.history")}
          onPress={onOpenHistory}
          startContent={<IoTimeOutline />}
        >
          <span className="hidden sm:inline">
            {t("poker.history")}
            {historyCount > 0 ? ` (${historyCount})` : ""}
          </span>
        </Button>
        <Button
          size="sm"
          variant="flat"
          className={COMPACT_BUTTON_CLASS}
          aria-label={t("poker.reset")}
          onPress={resetRound}
          startContent={<IoRefresh />}
        >
          <span className="hidden sm:inline">{t("poker.reset")}</span>
        </Button>
        <Button
          size="sm"
          color="primary"
          className="font-bold"
          onPress={toggleReveal}
          startContent={roomData?.revealed ? <IoEyeOff /> : <IoEye />}
        >
          {roomData?.revealed ? t("poker.hide") : t("poker.reveal")}
        </Button>
      </div>
    </Card>
  );
};

export default PlanningPokerHeader;
