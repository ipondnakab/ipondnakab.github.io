"use client";

import { textToCapital } from "@/functions/text-to-capital";
import { Skeleton, Switch, SwitchProps } from "@nextui-org/react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import SwitchAutoLabel from "../Switch/SwitchAutoLabel";

export interface ThemeSwitcherProps {
  disableLabel?: boolean;
  disableLabelAnimation?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  disableLabel,
  disableLabelAnimation,
}) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isChecked, setIsChecked] = useState(theme === "dark");

  useEffect(() => {
    setIsChecked(theme === "dark");
  }, [theme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted)
    return (
      <Skeleton className="rounded-full w-fit ml-1 mr-3">
        <div className="w-8 h-5 rounded-full bg-secondary"></div>
      </Skeleton>
    );

  const switchProps: SwitchProps = {
    size: "sm",
    color: "default",
    checked: isChecked,
    defaultSelected: isChecked,
    onClick: onChange,
    startContent: <FaMoon />,
    endContent: <FaSun />,
  };

  if (disableLabelAnimation)
    return (
      <Switch {...switchProps}>
        {textToCapital(theme || "").concat(" Mode")}
      </Switch>
    );

  return (
    <SwitchAutoLabel
      {...switchProps}
      label={textToCapital(theme || "").concat(" Mode")}
      disableLabel={disableLabel}
    />
  );
};
