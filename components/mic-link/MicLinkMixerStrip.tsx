"use client";

import { Button, Slider } from "@nextui-org/react";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";

import { MIC_LINK_MAX_GAIN, MIC_LINK_MIN_GAIN } from "@/constants/mic-link";
import { MicLinkStatus } from "@/interfaces/mic-link";
import MicLinkLevelMeter from "./MicLinkLevelMeter";
import MicLinkStatusChip from "./MicLinkStatusChip";

export interface MicLinkMixerStripProps {
  label: string;
  status: MicLinkStatus;
  level: number;
  gain: number;
  isMuted: boolean;
  isSoloed: boolean;
  // True when another channel is soloed, so this one is silenced by implication
  // rather than by its own mute button.
  isDimmed: boolean;
  onGainChange: (gain: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
}

const MicLinkMixerStrip: React.FC<MicLinkMixerStripProps> = ({
  label,
  status,
  level,
  gain,
  isMuted,
  isSoloed,
  isDimmed,
  onGainChange,
  onMuteToggle,
  onSoloToggle,
}) => {
  const { t } = useTranslation();
  const isSilent = isMuted || isDimmed;

  return (
    <div
      className={clsx(
        "flex flex-col gap-3 rounded-large border-1 p-4 transition-opacity",
        isSilent ? "border-default-200 opacity-60" : "border-default-300",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-small font-medium truncate" title={label}>
            {label}
          </span>
          <span className="text-tiny text-default-500">
            {t("micLink.mixer.gainValue", { value: gain.toFixed(2) })}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-none">
          <MicLinkStatusChip status={status} />
          <Button
            size="sm"
            isIconOnly
            variant={isMuted ? "solid" : "bordered"}
            color={isMuted ? "danger" : "default"}
            onPress={onMuteToggle}
            aria-label={t("micLink.mixer.mute")}
            aria-pressed={isMuted}
          >
            {t("micLink.mixer.muteShort")}
          </Button>
          <Button
            size="sm"
            isIconOnly
            variant={isSoloed ? "solid" : "bordered"}
            color={isSoloed ? "warning" : "default"}
            onPress={onSoloToggle}
            aria-label={t("micLink.mixer.solo")}
            aria-pressed={isSoloed}
          >
            {t("micLink.mixer.soloShort")}
          </Button>
        </div>
      </div>

      {/* The meter is pre-fader, so it keeps moving while the channel is muted
          — that is how you tell "not talking" from "muted". */}
      <MicLinkLevelMeter level={level} isActive={status === "live"} />

      <Slider
        size="sm"
        aria-label={t("micLink.mixer.gain")}
        value={gain}
        onChange={(next) =>
          onGainChange(Array.isArray(next) ? next[0] : (next as number))
        }
        minValue={MIC_LINK_MIN_GAIN}
        maxValue={MIC_LINK_MAX_GAIN}
        step={0.01}
        isDisabled={status !== "live"}
      />
    </div>
  );
};

export default MicLinkMixerStrip;
