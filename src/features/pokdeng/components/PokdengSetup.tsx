"use client";

import { Button, Card, Chip, Divider, Input } from "@nextui-org/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoAdd, IoCloseCircle, IoPlay } from "react-icons/io5";

import {
  POKDENG_DEFAULT_BET,
  POKDENG_MAX_BET,
  POKDENG_MAX_PLAYERS,
  POKDENG_MIN_BET,
  POKDENG_NAME_MAX_LENGTH,
} from "@/features/pokdeng/constants";

export interface PokdengSetupProps {
  onStart: (hostName: string, bet: number, playerNames: string[]) => void;
}

const PokdengSetup: React.FC<PokdengSetupProps> = ({ onStart }) => {
  const { t } = useTranslation();
  const [hostName, setHostName] = useState<string>("");
  const [bet, setBet] = useState<string>(String(POKDENG_DEFAULT_BET));
  const [playerName, setPlayerName] = useState<string>("");
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  const parsedBet = Number(bet);
  const isBetValid =
    Number.isFinite(parsedBet) &&
    parsedBet >= POKDENG_MIN_BET &&
    parsedBet <= POKDENG_MAX_BET;
  const canStart =
    hostName.trim() !== "" && isBetValid && playerNames.length > 0;

  const addPlayer = () => {
    const name = playerName.trim().slice(0, POKDENG_NAME_MAX_LENGTH);
    if (!name || playerNames.length >= POKDENG_MAX_PLAYERS) return;
    setPlayerNames((names) => [...names, name]);
    setPlayerName("");
  };

  const removePlayer = (index: number) =>
    setPlayerNames((names) => names.filter((_name, i) => i !== index));

  return (
    <div className="flex items-center justify-center p-4 py-8 sm:p-8">
      <Card isBlurred className="w-full max-w-md gap-4 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{t("pokdeng.setupTitle")}</h1>
          <p className="text-sm text-default-500">{t("pokdeng.setupIntro")}</p>
        </div>

        <Input
          isRequired
          variant="bordered"
          label={t("pokdeng.hostName")}
          placeholder={t("pokdeng.hostNamePlaceholder")}
          value={hostName}
          maxLength={POKDENG_NAME_MAX_LENGTH}
          onValueChange={setHostName}
        />

        <Input
          isRequired
          type="number"
          inputMode="numeric"
          variant="bordered"
          label={t("pokdeng.baseBet")}
          description={t("pokdeng.baseBetHint")}
          value={bet}
          min={POKDENG_MIN_BET}
          max={POKDENG_MAX_BET}
          isInvalid={bet !== "" && !isBetValid}
          errorMessage={
            bet !== "" && !isBetValid
              ? t("pokdeng.baseBetInvalid", {
                  min: POKDENG_MIN_BET,
                  max: POKDENG_MAX_BET,
                })
              : undefined
          }
          onValueChange={setBet}
        />

        <Divider />

        <div className="flex items-center justify-between">
          <h2 className="font-bold">{t("pokdeng.players")}</h2>
          <span className="text-xs text-default-400">
            {playerNames.length} / {POKDENG_MAX_PLAYERS}
          </span>
        </div>

        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addPlayer();
          }}
        >
          <Input
            variant="bordered"
            placeholder={t("pokdeng.playerNamePlaceholder")}
            value={playerName}
            maxLength={POKDENG_NAME_MAX_LENGTH}
            isDisabled={playerNames.length >= POKDENG_MAX_PLAYERS}
            onValueChange={setPlayerName}
          />
          <Button
            isIconOnly
            color="primary"
            type="submit"
            aria-label={t("pokdeng.addPlayer")}
            isDisabled={
              playerName.trim() === "" ||
              playerNames.length >= POKDENG_MAX_PLAYERS
            }
          >
            <IoAdd size={20} />
          </Button>
        </form>

        {playerNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {playerNames.map((name, index) => (
              <Chip
                key={`${name}-${index}`}
                variant="flat"
                color="primary"
                endContent={
                  <button
                    type="button"
                    aria-label={t("pokdeng.removePlayer", { name })}
                    className="pr-1"
                    onClick={() => removePlayer(index)}
                  >
                    <IoCloseCircle size={18} />
                  </button>
                }
              >
                {name}
              </Chip>
            ))}
          </div>
        )}

        <Button
          color="primary"
          size="lg"
          className="font-bold"
          isDisabled={!canStart}
          startContent={<IoPlay />}
          onPress={() => onStart(hostName.trim(), parsedBet, playerNames)}
        >
          {t("pokdeng.startGame")}
        </Button>
      </Card>
    </div>
  );
};

export default PokdengSetup;
