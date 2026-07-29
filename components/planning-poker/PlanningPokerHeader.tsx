"use client";

import { RoomData } from "@/interfaces/poker";
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
          {t("poker.players", {
            num: Object.keys(roomData?.votes || {}).length,
          })}
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
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="flat"
          onPress={onOpenHistory}
          startContent={<IoTimeOutline />}
        >
          {t("poker.history")}
          {historyCount > 0 ? ` (${historyCount})` : ""}
        </Button>
        <Button
          size="sm"
          variant="flat"
          onPress={resetRound}
          startContent={<IoRefresh />}
        >
          {t("poker.reset")}
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
