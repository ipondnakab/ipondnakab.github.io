import { Switch, SwitchProps } from "@nextui-org/react";
import clsx from "clsx";
import React, { useState } from "react";
import { delay } from "framer-motion";

export interface SwitchAutoLabelProps extends SwitchProps {
  disableLabel?: boolean;
  label?: string;
  labelWidth?: string;
}

const SwitchAutoLabel: React.FC<SwitchAutoLabelProps> = ({
  disableLabel,
  label,
  labelWidth,
  ...props
}) => {
  const [showText, setShowText] = useState(false);
  return (
    <Switch
      {...props}
      onClick={(e) => {
        if (!disableLabel) setShowText(true);
        props.onClick && props.onClick(e);
      }}
      onMouseLeave={() => !disableLabel && delay(() => setShowText(false), 500)}
    >
      {!disableLabel && (
        <p
          className={clsx(
            "text-xs line-clamp-1 overflow-hidden w-0 transition-all delay-200",
            showText && (labelWidth || `w-[64px]`),
          )}
        >
          {label}
        </p>
      )}
    </Switch>
  );
};

export default SwitchAutoLabel;
