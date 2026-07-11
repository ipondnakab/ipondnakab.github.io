"use client";

import { Switch, SwitchProps } from "@nextui-org/react";
import clsx from "clsx";
import { delay } from "framer-motion";
import React, { useState } from "react";

export interface SwitchAutoLabelProps extends SwitchProps {
  disableLabel?: boolean;
  label?: string;
  labelWidth?: string;
}

// NextUI's <Switch> prop type is a very large union. Spreading `props` into the
// JSX element makes TypeScript try to represent that union in full, which now
// exceeds its complexity budget (TS2590) given the extra type surface pulled in
// by the 3D stack. Referencing the component through a plain FC<SwitchProps>
// alias keeps the runtime identical while collapsing the union for the checker.
const BaseSwitch = Switch as unknown as React.FC<SwitchProps>;

const SwitchAutoLabel: React.FC<SwitchAutoLabelProps> = ({
  disableLabel,
  label,
  labelWidth,
  ...props
}) => {
  const [showText, setShowText] = useState(false);
  return (
    <BaseSwitch
      {...props}
      onClick={(e) => {
        if (!disableLabel) setShowText(true);
        if (props?.onClick) props.onClick(e);
      }}
      onMouseLeave={() => !disableLabel && delay(() => setShowText(false), 500)}
    >
      {!disableLabel && (
        <p
          className={clsx(
            "text-xs line-clamp-1 overflow-hidden w-0 max-w-0 transition-all delay-200",
            showText && (labelWidth || `w-[64px] max-w-[64px]`),
          )}
        >
          {label}
        </p>
      )}
    </BaseSwitch>
  );
};

export default SwitchAutoLabel;
