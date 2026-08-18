"use client";

import { Button, Card, Chip } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  IoArrowUndo,
  IoCash,
  IoLayers,
  IoPeople,
  IoRefresh,
  IoSettingsOutline,
  IoTimeOutline,
} from "react-icons/io5";

// Below `sm` these collapse to their icon so the header row stops overflowing
// on a phone. The hidden label is why each one still carries an aria-label.
const COMPACT_BUTTON_CLASS = "min-w-8 px-0 sm:min-w-16 sm:px-3";

export interface PokdengHeaderProps {
  bet: number;
  turnCount: number;
  playerCount: number;
  historyCount: number;
  canUndo: boolean;
  onUndo: () => void;
  onOpenHistory: () => void;
  onOpenPlayers: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
}

const PokdengHeader: React.FC<PokdengHeaderProps> = ({
  bet,
  turnCount,
  playerCount,
  historyCount,
  canUndo,
  onUndo,
  onOpenHistory,
  onOpenPlayers,
  onOpenSettings,
  onReset,
}) => {
  const { t } = useTranslation();
  return (
    <Card
      isBlurred
      className="flex flex-row items-center justify-between gap-2 rounded-3xl p-3 shadow-sm sm:p-4"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Chip
          size="lg"
          variant="flat"
          color="primary"
          startContent={<IoLayers className="ml-1" />}
        >
          <span className="font-bold tabular-nums">
            {t("pokdeng.turnNumber", { num: turnCount })}
          </span>
        </Chip>
        <Chip
          size="lg"
          variant="flat"
          color="warning"
          startContent={<IoCash className="ml-1" />}
          className="hidden sm:flex"
        >
          <span className="font-bold tabular-nums">
            {t("pokdeng.betChip", { bet: bet.toLocaleString() })}
          </span>
        </Chip>
        <Chip
          size="lg"
          variant="flat"
          startContent={<IoPeople className="ml-1" />}
          className="hidden md:flex"
        >
          <span className="font-bold tabular-nums">{playerCount}</span>
        </Chip>
      </div>

      <div className="flex shrink-0 gap-1 sm:gap-2">
        <Button
          size="sm"
          variant="flat"
          className={COMPACT_BUTTON_CLASS}
          aria-label={t("pokdeng.undo")}
          isDisabled={!canUndo}
          onPress={onUndo}
          startContent={<IoArrowUndo />}
        >
          <span className="hidden sm:inline">{t("pokdeng.undo")}</span>
        </Button>
        <Button
          size="sm"
          variant="flat"
          className={COMPACT_BUTTON_CLASS}
          aria-label={t("pokdeng.history")}
          onPress={onOpenHistory}
          startContent={<IoTimeOutline />}
        >
          <span className="hidden sm:inline">
            {t("pokdeng.history")}
            {historyCount > 0 ? ` (${historyCount})` : ""}
          </span>
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          aria-label={t("pokdeng.managePlayers")}
          onPress={onOpenPlayers}
        >
          <IoPeople />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          aria-label={t("pokdeng.settings")}
          onPress={onOpenSettings}
        >
          <IoSettingsOutline />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="danger"
          aria-label={t("pokdeng.reset")}
          onPress={onReset}
        >
          <IoRefresh />
        </Button>
      </div>
    </Card>
  );
};

export default PokdengHeader;
