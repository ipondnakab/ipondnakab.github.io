"use client";

import clsx from "clsx";
import React from "react";

const SEGMENT_COUNT = 28;
// Where the meter turns amber, then red. Matched to the level curve in
// `createAudioLevelMonitor`, not to true dBFS.
const WARN_AT = 0.72;
const PEAK_AT = 0.9;

export interface MicLinkLevelMeterProps {
  level: number; // 0..1
  isActive: boolean;
  label?: string;
}

const MicLinkLevelMeter: React.FC<MicLinkLevelMeterProps> = ({
  level,
  isActive,
  label,
}) => {
  const lit = Math.round(level * SEGMENT_COUNT);

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <div className="flex items-center justify-between text-tiny text-default-500">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(level * 100)}%</span>
        </div>
      )}
      <div
        className="flex items-end gap-[3px] h-12 w-full"
        role="meter"
        aria-label={label}
        aria-valuenow={Math.round(level * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: SEGMENT_COUNT }, (_unused, index) => {
          const position = index / SEGMENT_COUNT;
          const isLit = isActive && index < lit;
          return (
            <div
              key={index}
              className={clsx(
                "flex-1 rounded-sm transition-all duration-75",
                // Taller towards the right so the bar reads as a level, not a
                // graphic equaliser.
                "min-h-[30%]",
                isLit
                  ? position >= PEAK_AT
                    ? "bg-danger"
                    : position >= WARN_AT
                      ? "bg-warning"
                      : "bg-primary"
                  : "bg-default-200 dark:bg-default-100",
              )}
              style={{ height: `${35 + position * 65}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MicLinkLevelMeter;
