"use client";

import { Button, Card, Divider } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

export interface MicLinkLobbyProps {
  onStart: () => void;
}

const STEP_KEYS = ["step1", "step2", "step3"] as const;

const MicLinkLobby: React.FC<MicLinkLobbyProps> = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center p-4 py-10 min-h-[calc(100vh-4rem)]">
      <Card isBlurred className="max-w-md w-full p-8 gap-5 shadow-xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t("micLink.lobby.title")}</h1>
          <p className="text-small text-default-600">
            {t("micLink.lobby.description")}
          </p>
        </div>

        <Divider />

        <ol className="flex flex-col gap-3">
          {STEP_KEYS.map((key, index) => (
            <li key={key} className="flex gap-3 items-start">
              <span className="flex-none w-6 h-6 rounded-full bg-primary/15 text-primary text-tiny font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-small text-default-600">
                {t(`micLink.lobby.${key}`)}
              </span>
            </li>
          ))}
        </ol>

        <Button color="primary" size="lg" onPress={onStart}>
          {t("micLink.lobby.start")}
        </Button>

        <p className="text-tiny text-default-500 text-center">
          {t("micLink.lobby.privacy")}
        </p>
      </Card>
    </div>
  );
};

export default MicLinkLobby;
