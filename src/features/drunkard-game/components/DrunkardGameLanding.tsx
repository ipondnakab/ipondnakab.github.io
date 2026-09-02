"use client";

import {
  DRUNKARD_GAME_ANDROID_REDIRECT_DELAY_MS,
  DRUNKARD_GAME_HIGHLIGHTS,
  DRUNKARD_GAME_MODES,
  DRUNKARD_GAME_PARTY_ICON,
  DRUNKARD_GAME_PLAY_URL,
} from "@/features/drunkard-game/constants";
import { getEvasivePosition } from "@/features/drunkard-game/lib/get-evasive-position";
import { isAndroidUserAgent } from "@/features/drunkard-game/lib/is-android-user-agent";
import type { EvasivePoint } from "@/features/drunkard-game/model/evasive-button";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { HiArrowRight, HiClock } from "react-icons/hi";

export interface DrunkardGameLandingProps {}

const DrunkardGameLanding: React.FC<DrunkardGameLandingProps> = () => {
  const { t } = useTranslation();
  const PartyIcon = DRUNKARD_GAME_PARTY_ICON;
  const appStoreAreaRef = React.useRef<HTMLDivElement>(null);
  const appStoreButtonRef = React.useRef<HTMLAnchorElement>(null);
  const [appStorePosition, setAppStorePosition] =
    React.useState<EvasivePoint | null>(null);

  React.useEffect(() => {
    if (!isAndroidUserAgent(window.navigator.userAgent)) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      window.open(DRUNKARD_GAME_PLAY_URL, "_blank");
    }, DRUNKARD_GAME_ANDROID_REDIRECT_DELAY_MS);

    return () => window.clearTimeout(redirectTimer);
  }, []);

  const handleAppStorePointerLeave = () => {
    setAppStorePosition(null);
  };
  const handleAppStorePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (
      event.pointerType !== "mouse" ||
      !appStoreAreaRef.current ||
      !appStoreButtonRef.current
    ) {
      return;
    }

    const areaRect = appStoreAreaRef.current.getBoundingClientRect();
    const buttonRect = appStoreButtonRef.current.getBoundingClientRect();
    const pointer = {
      x: event.clientX - areaRect.left,
      y: event.clientY - areaRect.top,
    };
    const buttonCenter = {
      x: buttonRect.left - areaRect.left + buttonRect.width / 2,
      y: buttonRect.top - areaRect.top + buttonRect.height / 2,
    };
    const distance = Math.hypot(
      pointer.x - buttonCenter.x,
      pointer.y - buttonCenter.y,
    );

    if (distance < 110) {
      setAppStorePosition(
        getEvasivePosition({
          pointer,
          container: { width: areaRect.width, height: areaRect.height },
          button: { width: buttonRect.width, height: buttonRect.height },
          padding: 4,
        }),
      );
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-2 pb-12 sm:p-8">
      <section className="relative overflow-hidden rounded-large bg-content1/80 p-6 shadow-medium backdrop-blur-md sm:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative grid items-center gap-10">
          <div className="flex flex-col items-start">
            <span className="mb-5 text-tiny font-semibold uppercase tracking-[0.2em] text-primary">
              {t("drunkardGame.eyebrow")}
            </span>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {t("drunkardGame.hero.title")}{" "}
              <span className="text-primary">
                {t("drunkardGame.hero.accent")}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-small leading-relaxed text-default-600 sm:text-base">
              {t("drunkardGame.hero.description")}
            </p>

            <div className="relative mt-7 h-40 w-full max-w-xl sm:h-24 gap-4 flex flex-col sm:flex-row items-center justify-center">
              <a
                href={DRUNKARD_GAME_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("drunkardGame.downloadAria")}
                className="group w-56 absolute left-0 top-0 inline-flex min-h-12 items-center gap-3 rounded-medium bg-primary px-5 py-2.5 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:opacity-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <FaGooglePlay className="text-2xl" aria-hidden />
                <span className="flex flex-col leading-none">
                  <span className="text-[9px] font-semibold uppercase tracking-wider">
                    {t("drunkardGame.getItOn")}
                  </span>
                  <span className="mt-1 text-base font-bold">Google Play</span>
                </span>
                <HiArrowRight
                  className="ml-1 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </a>

              <div
                ref={appStoreAreaRef}
                className="absolute inset-x-0 top-16 h-20 sm:bottom-0 sm:left-60 sm:right-0 sm:top-0 sm:h-24"
                onPointerMove={handleAppStorePointerMove}
                onPointerLeave={handleAppStorePointerLeave}
              >
                <a
                  ref={appStoreButtonRef}
                  type="button"
                  aria-disabled="true"
                  aria-label={t("drunkardGame.appStoreAria")}
                  style={
                    appStorePosition
                      ? {
                          left: appStorePosition.x,
                          top: appStorePosition.y,
                        }
                      : undefined
                  }
                  className="group w-56 absolute left-0 top-0 inline-flex min-h-12 items-center gap-3 rounded-medium bg-foreground-50 px-5 py-2.5 text-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:opacity-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-none"
                >
                  <FaApple className="text-2xl" aria-hidden />
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-[9px] font-semibold uppercase tracking-wider">
                      {t("drunkardGame.getItOn")}
                    </span>
                    <span className="mt-1 text-base font-bold">App Store</span>
                  </span>
                  <span className="ml-1 text-tiny text-default-500 flex items-center gap-1">
                    {t("drunkardGame.comingSoon")}
                    <HiClock aria-hidden className="text-[8px]" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="relative mx-auto w-full max-w-sm px-4 cursor-pointer"
        onClick={() => window.open(DRUNKARD_GAME_PLAY_URL, "_blank")}
      >
        <div
          aria-hidden
          className="absolute inset-8 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative rotate-2 rounded-[2.5rem] border border-default-200 bg-background/70 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:rotate-0">
          <div className="overflow-hidden rounded-[2rem] border border-default-100 bg-background-100 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-2xl text-primary-foreground shadow-lg shadow-primary/30">
                  <PartyIcon aria-hidden />
                </span>
                <div>
                  <p className="font-black uppercase tracking-tight">
                    {t("drunkardGame.appName")}
                  </p>
                  <p className="text-xs text-default-500">
                    {t("drunkardGame.appTag")}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
                18+
              </span>
            </div>

            <div className="my-8 grid aspect-[4/3] place-items-center rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary/25 via-background-200 to-warning/20 p-6 text-center">
              <div>
                <p className="text-6xl sm:text-7xl" aria-hidden>
                  🍻
                </p>
                <p className="mt-4 text-2xl font-black sm:text-3xl">
                  {t("drunkardGame.previewTitle")}
                </p>
                <p className="mt-2 text-sm text-default-500">
                  {t("drunkardGame.previewSubtitle")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DRUNKARD_GAME_HIGHLIGHTS.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-xl bg-default-100 px-2 py-3 text-center text-xs font-semibold text-default-600"
                >
                  {t(`drunkardGame.highlights.${highlight}`)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="px-1">
          <span className="text-tiny font-semibold uppercase tracking-[0.2em] text-primary">
            {t("drunkardGame.games.eyebrow")}
          </span>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            {t("drunkardGame.games.title")}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {DRUNKARD_GAME_MODES.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <article
                key={mode.key}
                className="group relative min-h-64 overflow-hidden rounded-large bg-content1/80 p-6 shadow-medium backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="absolute right-5 top-4 text-4xl font-bold text-default-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-large bg-primary/10 text-3xl text-primary">
                  <Icon aria-hidden />
                </span>
                <h3 className="mt-7 text-xl font-bold">
                  {t(`drunkardGame.games.${mode.key}.title`)}
                </h3>
                <p className="mt-3 text-small leading-relaxed text-default-600">
                  {t(`drunkardGame.games.${mode.key}.description`)}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col items-start gap-5 rounded-large bg-content1/80 p-6 shadow-medium backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-large bg-primary/10 text-2xl text-primary">
            <PartyIcon aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              {t("drunkardGame.cta.title")}
            </h2>
            <p className="mt-2 max-w-xl text-small leading-relaxed text-default-600">
              {t("drunkardGame.cta.description")}
            </p>
            <a
              href="/drunkard-game/privacy"
              className="mt-3 inline-block text-small text-default-500 underline decoration-default-300 underline-offset-4 transition-colors hover:text-primary"
            >
              {t("drunkardGame.privacy")}
            </a>
          </div>
        </div>
        <a
          href={DRUNKARD_GAME_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-medium bg-primary px-5 py-2.5 text-small font-semibold text-primary-foreground transition-opacity hover:opacity-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <FaGooglePlay aria-hidden />
          {t("drunkardGame.cta.button")}
        </a>
      </section>
    </main>
  );
};

export default DrunkardGameLanding;
