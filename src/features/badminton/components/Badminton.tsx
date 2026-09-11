"use client";

import {
  FORMATS,
  GENDERS,
  MAX_PLAYERS,
  MOBILE_VIEWS,
  MODES,
  PAIRINGS,
  PLAYER_DEFAULTS,
  STANDING_COLUMNS,
} from "@/features/badminton/constants";
import {
  createCompetition,
  randomMatches,
  standings,
} from "@/features/badminton/lib/draw";
import { useBadmintonSession } from "@/features/badminton/lib/use-badminton-session";
import { PlayerForm, Team } from "@/features/badminton/model/badminton";
import FormHookWrapper from "@/shared/ui/form/FormHookWrapper";
import InputSelect from "@/shared/ui/inputs/InputSelect";
import InputString from "@/shared/ui/inputs/InputString";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { GiShuttlecock } from "react-icons/gi";
import {
  IoAdd,
  IoArrowForward,
  IoCheckmark,
  IoChevronDown,
  IoClose,
  IoPeopleOutline,
  IoShuffleOutline,
  IoTimeOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import BadmintonMatchCard from "./BadmintonMatchCard";

export interface BadmintonProps {}
const Badminton: React.FC<BadmintonProps> = () => {
  const { t } = useTranslation();
  const { session, setField, storageReady, storageUnavailable } =
    useBadmintonSession();
  const { players, mode, format, pairing, view, draw, history, rounds } =
    session;
  const [error, setError] = useState(false);
  const clearResults = () => {
    setField("draw", null);
    setField("rounds", []);
    setError(false);
  };
  const teamName = (team: Team) => team.map((p) => p.name).join(" / ");
  const minimum = format === "doubles" ? 4 : 2;
  const invalid =
    players.length < minimum ||
    (mode === "competition" &&
      format === "doubles" &&
      players.length % 2 !== 0);
  const table = standings(rounds);
  const buttonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
  const panelClass =
    "min-w-0 rounded-3xl border border-default-200/70 bg-content1/90 p-4 shadow-sm backdrop-blur-sm sm:p-6";
  const selectClass =
    "min-h-12 min-w-0 rounded-xl px-2 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

  if (!storageReady)
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p role="status" className="text-sm text-default-500">
          {t("badminton.loadingSession")}
        </p>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-3 py-5 pb-10 sm:space-y-7 sm:px-6 sm:py-8">
      {storageUnavailable && (
        <p
          role="status"
          className="rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning-600"
        >
          {t("badminton.storageUnavailable")}
        </p>
      )}
      <header className="relative isolate overflow-hidden rounded-3xl border border-primary/15 bg-content1/80 p-5 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary sm:h-16 sm:w-16 sm:text-4xl">
            <GiShuttlecock aria-hidden />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
              {t("badminton.eyebrow")}
            </p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
              {t("badminton.title")}
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-default-600 sm:text-base">
          {t("badminton.subtitle")}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-default-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-default-100 px-3 py-2">
            <IoPeopleOutline aria-hidden className="text-base" />
            {t("badminton.players", { count: players.length })}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-primary">
            <IoTimeOutline aria-hidden className="text-base" />
            {t("badminton.roundsCount", { count: history.length })}
          </span>
        </div>
      </header>

      <nav
        aria-label={t("badminton.navigation")}
        className="sticky top-16 z-20 grid grid-cols-3 gap-1 rounded-2xl border border-default-200/70 bg-content1/95 p-1 shadow-sm backdrop-blur-md lg:hidden"
      >
        {MOBILE_VIEWS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            aria-controls={`badminton-${value}`}
            onClick={() => setField("view", value)}
            className={`${buttonClass} flex-col gap-1 px-1 py-2 text-xs ${view === value ? "bg-primary text-primary-foreground shadow-sm" : "text-default-600 hover:bg-default-100"}`}
          >
            {value === "players" ? (
              <IoPeopleOutline aria-hidden className="text-lg" />
            ) : value === "play" ? (
              <GiShuttlecock aria-hidden className="text-lg" />
            ) : (
              <IoTimeOutline aria-hidden className="text-lg" />
            )}
            {t(`badminton.view${value}`)}
          </button>
        ))}
      </nav>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
        <section
          id="badminton-players"
          aria-labelledby="roster-title"
          className={`${panelClass} ${view === "players" ? "block" : "hidden"} lg:block`}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2
              id="roster-title"
              className="flex items-center gap-2 text-lg font-bold"
            >
              <IoPeopleOutline aria-hidden className="text-primary" />
              {t("badminton.viewplayers")}
            </h2>
            <span className="rounded-full bg-default-100 px-3 py-1 text-xs font-semibold tabular-nums text-default-600">
              {players.length} / {MAX_PLAYERS}
            </span>
          </div>
          <FormHookWrapper<PlayerForm>
            defaultValues={PLAYER_DEFAULTS}
            preventEnterSubmit={false}
            onSubmit={(data, _event, form) => {
              if (players.length >= MAX_PLAYERS) return;
              setField("players", (current) => [
                ...current,
                { ...data, name: data.name.trim(), id: crypto.randomUUID() },
              ]);
              clearResults();
              form?.reset(PLAYER_DEFAULTS);
            }}
          >
            {() => (
              <div className="space-y-3 rounded-2xl bg-default-100/60 p-3">
                <InputString
                  name="name"
                  label={t("badminton.name")}
                  maxLength={40}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "bg-content1 shadow-none",
                  }}
                  rules={{
                    validate: (value) =>
                      String(value).trim().length > 0 ||
                      t("badminton.nameRequired"),
                    maxLength: {
                      value: 40,
                      message: t("badminton.nameRequired"),
                    },
                  }}
                />
                <InputSelect
                  name="gender"
                  label={t("badminton.gender")}
                  rules={{ required: true }}
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {t(`badminton.${g}`)}
                    </option>
                  ))}
                </InputSelect>
                <button
                  type="submit"
                  disabled={players.length >= MAX_PLAYERS}
                  className={`${buttonClass} w-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`}
                >
                  <IoAdd aria-hidden className="text-lg" />
                  {t("badminton.add")}
                </button>
              </div>
            )}
          </FormHookWrapper>
          <div aria-live="polite" className="mt-5">
            {players.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-default-300 px-4 py-8 text-center">
                <IoPeopleOutline
                  aria-hidden
                  className="mx-auto mb-3 text-3xl text-default-400"
                />
                <p className="text-sm leading-relaxed text-default-500">
                  {t("badminton.empty")}
                </p>
              </div>
            ) : (
              <ul className="space-y-1 lg:max-h-[420px] lg:overflow-y-auto">
                {players.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 even:bg-default-100/50"
                  >
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold tabular-nums text-primary"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold">
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-xs text-default-500">
                        {t(`badminton.${p.gender}`)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-default-500 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={t("badminton.removePlayer", { name: p.name })}
                      onClick={() => {
                        setField(
                          "players",
                          players.filter((player) => player.id !== p.id),
                        );
                        clearResults();
                      }}
                    >
                      <IoClose aria-hidden className="text-lg" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => setField("view", "play")}
            className={`${buttonClass} mt-5 w-full bg-primary/10 text-primary lg:hidden`}
          >
            {t("badminton.continuePlay")}
            <IoArrowForward aria-hidden />
          </button>
          <p className="mt-5 border-t border-default-200/60 pt-4 text-xs leading-relaxed text-default-500">
            {t("badminton.sessionNote")}
          </p>
        </section>

        <div
          className={`min-w-0 space-y-5 ${view === "players" ? "hidden" : "block"} lg:block`}
        >
          <section
            id="badminton-play"
            aria-labelledby="draw-title"
            className={`min-w-0 space-y-5 ${view === "history" ? "hidden" : "block"} lg:block`}
          >
            <div className={panelClass}>
              <h2 id="draw-title" className="mb-5 text-lg font-bold">
                {t("badminton.setup")}
              </h2>
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-default-100 p-1">
                {MODES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={mode === value}
                    className={`${selectClass} flex items-center justify-center gap-2 ${mode === value ? "bg-content1 text-primary shadow-sm" : "text-default-600 hover:bg-content1/50"}`}
                    onClick={() => {
                      setField("mode", value);
                      clearResults();
                    }}
                  >
                    {value === "random" ? (
                      <IoShuffleOutline
                        aria-hidden
                        className="shrink-0 text-lg"
                      />
                    ) : (
                      <IoTrophyOutline
                        aria-hidden
                        className="shrink-0 text-lg"
                      />
                    )}
                    {t(`badminton.${value}`)}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-default-600">
                {t(
                  mode === "random"
                    ? format === "singles"
                      ? "badminton.randomSinglesHelp"
                      : "badminton.randomHelp"
                    : "badminton.competitionHelp",
                )}
              </p>
              <fieldset className="mt-5">
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-default-500">
                  {t("badminton.format")}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {FORMATS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={format === value}
                      className={`${selectClass} border ${format === value ? "border-primary/40 bg-primary/10 text-primary" : "border-default-200 text-default-600"}`}
                      onClick={() => {
                        setField("format", value);
                        clearResults();
                      }}
                    >
                      {t(`badminton.${value}`)}
                    </button>
                  ))}
                </div>
              </fieldset>
              {format === "doubles" && (
                <fieldset className="mt-5">
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-default-500">
                    {t("badminton.pairing")}
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {PAIRINGS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={pairing === value}
                        className={`${selectClass} border ${pairing === value ? "border-primary/40 bg-primary/10 text-primary" : "border-default-200 text-default-600 hover:bg-default-100"}`}
                        onClick={() => {
                          setField("pairing", value);
                          clearResults();
                        }}
                      >
                        {t(`badminton.${value}`)}
                      </button>
                    ))}
                  </div>
                  <details className="mt-2 text-xs text-default-500">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                      {t("badminton.pairingGuide")}
                      <IoChevronDown aria-hidden />
                    </summary>
                    <p className="pb-3 leading-relaxed">
                      {t("badminton.pairingHelp")}
                    </p>
                  </details>
                </fieldset>
              )}
              {error && (
                <p
                  role="alert"
                  className="mt-3 rounded-2xl bg-danger/10 p-3 text-sm text-danger"
                >
                  {t("badminton.incompatible")}
                </p>
              )}
              {invalid && (
                <p
                  id="draw-requirements"
                  className="mt-4 rounded-2xl bg-warning/10 p-3 text-sm text-warning-600"
                >
                  {t(
                    players.length < minimum
                      ? "badminton.minimum"
                      : "badminton.evenRequired",
                    { count: minimum },
                  )}
                </p>
              )}
              <button
                type="button"
                disabled={invalid}
                aria-describedby={invalid ? "draw-requirements" : undefined}
                className={`${buttonClass} mt-4 min-h-14 w-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`}
                onClick={() => {
                  setError(false);
                  if (mode === "random") {
                    const next = randomMatches(
                      players,
                      pairing,
                      Math.random,
                      history,
                      format,
                    );
                    setField("draw", next);
                    setField("history", (current) => [
                      ...current,
                      { ...next, pairing },
                    ]);
                  } else {
                    try {
                      setField(
                        "rounds",
                        createCompetition(players, format, pairing),
                      );
                    } catch {
                      setError(true);
                    }
                  }
                }}
              >
                <IoShuffleOutline aria-hidden className="shrink-0 text-xl" />
                {t(
                  mode === "random" && history.length
                    ? "badminton.nextDraw"
                    : draw || rounds.length
                      ? "badminton.regenerate"
                      : "badminton.generate",
                )}
              </button>
            </div>

            <div aria-live="polite" className="space-y-4">
              {!draw && !rounds.length && (
                <div className="rounded-3xl border border-dashed border-default-300 bg-content1/40 px-6 py-10 text-center">
                  <GiShuttlecock
                    aria-hidden
                    className="mx-auto mb-4 text-4xl text-primary/50"
                  />
                  <h2 className="font-semibold">{t("badminton.readyTitle")}</h2>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-default-500">
                    {t("badminton.ready")}
                  </p>
                </div>
              )}
              {draw && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold">
                      {t("badminton.matches")}
                    </h2>
                    <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                      {t("badminton.round", { number: history.length })}
                    </span>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    {draw.matches.map((teams, i) => (
                      <BadmintonMatchCard
                        key={i}
                        teams={teams}
                        number={i + 1}
                      />
                    ))}
                  </div>
                  {!!draw.waiting.length && (
                    <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning-600">
                        <IoTimeOutline aria-hidden />
                        {t("badminton.waiting")}
                      </h3>
                      <p className="mt-2 break-words text-sm leading-relaxed text-foreground">
                        {teamName(draw.waiting)}
                      </p>
                    </div>
                  )}
                </>
              )}
              {!!rounds.length && (
                <>
                  <div className={panelClass}>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                      <IoTrophyOutline aria-hidden className="text-primary" />
                      {t("badminton.standings")}
                    </h2>
                    <div className="space-y-3 sm:hidden">
                      {table.map((row) => (
                        <article
                          key={row.team[0].id}
                          className="rounded-2xl bg-default-100/60 p-4"
                        >
                          <h3 className="break-words text-sm font-semibold">
                            {teamName(row.team)}
                          </h3>
                          <dl className="mt-3 grid grid-cols-3 gap-2">
                            {STANDING_COLUMNS.filter(
                              (key) => key !== "team",
                            ).map((key) => (
                              <div key={key}>
                                <dt className="text-xs text-default-500">
                                  {t(`badminton.${key}`)}
                                </dt>
                                <dd
                                  className={`mt-1 text-lg font-semibold tabular-nums ${key === "wins" ? "text-primary" : ""}`}
                                >
                                  {row[key]}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </article>
                      ))}
                    </div>
                    <div className="hidden sm:block">
                      <table className="w-full table-fixed text-left text-sm">
                        <caption className="sr-only">
                          {t("badminton.standings")}
                        </caption>
                        <thead>
                          <tr>
                            {STANDING_COLUMNS.map((key) => (
                              <th
                                key={key}
                                scope="col"
                                className={`border-b border-default-200 pb-3 text-xs font-medium text-default-500 ${key === "team" ? "w-1/2" : "text-center"}`}
                              >
                                {t(`badminton.${key}`)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.map((row) => (
                            <tr
                              key={row.team[0].id}
                              className="border-b border-default-200/50 last:border-0"
                            >
                              <th
                                scope="row"
                                className="break-words py-4 pr-3 font-semibold"
                              >
                                {teamName(row.team)}
                              </th>
                              <td className="py-4 text-center tabular-nums">
                                {row.played}
                              </td>
                              <td className="py-4 text-center font-bold tabular-nums text-primary">
                                {row.wins}
                              </td>
                              <td className="py-4 text-center tabular-nums">
                                {row.losses}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <h2 className="pt-2 text-lg font-bold">
                    {t("badminton.schedule")}
                  </h2>
                  <p className="text-sm leading-relaxed text-default-500">
                    {t("badminton.winnerHelp")}
                  </p>
                  {rounds.map((round, r) => (
                    <section key={r} className="space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-default-600">
                        <span
                          className="h-1 w-4 rounded-full bg-primary"
                          aria-hidden
                        />
                        {t("badminton.round", { number: r + 1 })}
                      </h3>
                      <div className="grid gap-4 xl:grid-cols-2">
                        {round.map((match, m) => (
                          <BadmintonMatchCard
                            key={m}
                            teams={match.teams}
                            number={m + 1}
                            winner={match.winner}
                            onSelectWinner={(side) =>
                              setField("rounds", (current) =>
                                current.map((items, ri) =>
                                  ri !== r
                                    ? items
                                    : items.map((item, mi) =>
                                        mi !== m
                                          ? item
                                          : {
                                              ...item,
                                              winner:
                                                item.winner === side
                                                  ? null
                                                  : side,
                                            },
                                      ),
                                ),
                              )
                            }
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </>
              )}
            </div>
          </section>

          <section
            id="badminton-history"
            aria-labelledby="random-history-title"
            className={`${panelClass} ${view === "history" ? "block" : "hidden"} lg:block`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="random-history-title"
                className="flex items-center gap-2 text-lg font-bold"
              >
                <IoTimeOutline aria-hidden className="text-primary" />
                {t("badminton.history")}
              </h2>
              {history.length > 0 && (
                <button
                  type="button"
                  className={`${buttonClass} px-3 text-default-500 hover:bg-danger/10 hover:text-danger`}
                  onClick={() => {
                    setField("history", []);
                    setField("draw", null);
                  }}
                >
                  {t("badminton.clearHistory")}
                </button>
              )}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-default-500">
              {t("badminton.historyHelp")}
            </p>
            {!history.length ? (
              <div className="py-8 text-center">
                <IoTimeOutline
                  aria-hidden
                  className="mx-auto mb-3 text-3xl text-default-400"
                />
                <p className="text-sm text-default-500">
                  {t("badminton.emptyHistory")}
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {[...history].reverse().map((entry, index) => (
                  <details
                    key={history.length - index}
                    className="group rounded-2xl border border-default-200/70 bg-default-100/30 open:bg-default-100/60"
                  >
                    <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl px-3 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                      <span
                        aria-hidden
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-content1 text-xs font-bold tabular-nums text-default-600"
                      >
                        {String(history.length - index).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {t("badminton.round", {
                            number: history.length - index,
                          })}
                        </span>
                        <span className="mt-0.5 block text-xs text-default-500">
                          {t(`badminton.${entry.format}`)}
                          {entry.format === "doubles" && (
                            <> · {t(`badminton.${entry.pairing}`)}</>
                          )}
                        </span>
                      </span>
                      <IoChevronDown
                        aria-hidden
                        className="shrink-0 text-default-400 group-open:rotate-180"
                      />
                    </summary>
                    <div className="space-y-3 border-t border-default-200/60 p-3">
                      {entry.matches.map((teams, i) => (
                        <BadmintonMatchCard
                          key={i}
                          teams={teams}
                          number={i + 1}
                        />
                      ))}
                      {!!entry.waiting.length && (
                        <p className="break-words px-1 text-sm text-default-600">
                          {t("badminton.waiting")}: {teamName(entry.waiting)}
                        </p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-default-500">
        <IoCheckmark aria-hidden className="shrink-0" />
        {t(
          storageUnavailable
            ? "badminton.temporarySession"
            : "badminton.localSession",
        )}
      </p>
    </div>
  );
};
export default Badminton;
