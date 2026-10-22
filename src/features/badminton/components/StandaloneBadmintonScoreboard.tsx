"use client";

import BadmintonScoreboard from "@/features/badminton/components/BadmintonScoreboard";
import { Team } from "@/features/badminton/model/badminton";
import { Button, Input } from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GiShuttlecock } from "react-icons/gi";

const StandaloneBadmintonScoreboard = () => {
  const { t } = useTranslation();
  const [names, setNames] = useState(["Team 1", "Team 2"]);
  const teams: Team[] = names.map((name, index) => [
    {
      id: String(index),
      name: name.trim() || `Team ${index + 1}`,
      gender: "other",
    },
  ]);

  return (
    <main className="w-full max-w-none space-y-5 px-2 py-5 pb-10 sm:px-4 lg:px-6">
      <header className="relative isolate overflow-hidden rounded-3xl border border-primary/15 bg-content1/80 p-3 sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
            <GiShuttlecock aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {t("badminton.scoreboard")}
            </h1>
            <p className="text-sm text-default-500">
              {t("badminton.standaloneHint")}
            </p>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2">
        {names.map((name, index) => (
          <Input
            key={index}
            label={t("badminton.teamLabel", { number: index + 1 })}
            value={name}
            onValueChange={(value) =>
              setNames((current) =>
                current.map((previous, side) =>
                  side === index ? value : previous,
                ),
              )
            }
            variant="bordered"
            classNames={{ inputWrapper: "bg-content1" }}
          />
        ))}
      </div>
      <BadmintonScoreboard teams={teams} />
      <Button
        as={Link}
        href="/mini-project/badminton/live"
        color="primary"
        fullWidth
      >
        Create or join a live scoreboard room
      </Button>
      <Button as={Link} href="/badminton" variant="light" color="primary">
        {t("badminton.openOrganizer")}
      </Button>
    </main>
  );
};

export default StandaloneBadmintonScoreboard;
