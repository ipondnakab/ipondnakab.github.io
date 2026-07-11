"use client";

import { Skeleton, Switch, SwitchProps } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlayCircle, FaStopCircle } from "react-icons/fa";

import SwitchAutoLabel from "./SwitchAutoLabel";

export interface AnimationSwitcherProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  disableLabelAnimation?: boolean;
}

const switchProps: SwitchProps = {
  size: "sm",
  color: "default",
  startContent: <FaPlayCircle />,
  endContent: <FaStopCircle />,
};

// See SwitchAutoLabel: alias collapses NextUI's huge <Switch> prop union so the
// spread below stays within TypeScript's complexity budget (TS2590).
const BaseSwitch = Switch as unknown as React.FC<SwitchProps>;

const AnimationSwitcher: React.FC<AnimationSwitcherProps> = ({
  setShow,
  show,
  disableLabelAnimation,
}) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const onChangeAnimation = () => {
    localStorage.setItem("animation", show ? "0" : "1");
    setShow(!show);
  };

  useEffect(() => {
    if (window && window.localStorage) {
      const animation = window.localStorage.getItem("animation");
      setShow(animation === null ? true : animation === "1");
    }
    setMounted(true);
  }, [setShow]);

  if (!mounted)
    return (
      <Skeleton className="rounded-full w-fit ml-1 mr-3">
        <div className="w-8 h-5 rounded-full bg-secondary"></div>
      </Skeleton>
    );

  const label = show ? t("switches.animationOn") : t("switches.animationOff");

  if (disableLabelAnimation)
    return (
      <BaseSwitch
        {...switchProps}
        isSelected={show}
        onChange={onChangeAnimation}
      >
        {label}
      </BaseSwitch>
    );

  return (
    <SwitchAutoLabel
      {...switchProps}
      size="sm"
      onChange={onChangeAnimation}
      isSelected={show}
      label={label}
      labelWidth="w-[78px] max-w-[78px]"
    />
  );
};

export default AnimationSwitcher;
