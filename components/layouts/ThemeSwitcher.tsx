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

const switchProps: SwitchProps = {
  size: "sm",
  color: "default",
  startContent: <FaMoon />,
  endContent: <FaSun />,
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  disableLabel,
  disableLabelAnimation,
}) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === "dark");

  const onChange = () => {
    const val = theme === "dark" ? "light" : "dark";
    setTheme(val);
    setIsDark(val === "dark");
  };

  useEffect(() => {
    if (window && window.localStorage) {
      const theme = window.localStorage.getItem("theme");
      setIsDark(theme === null ? true : theme === "dark");
    }
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <Skeleton className="rounded-full w-fit ml-1 mr-3">
        <div className="w-8 h-5 rounded-full bg-secondary"></div>
      </Skeleton>
    );

  if (disableLabelAnimation)
    return (
      <Switch {...switchProps} isSelected={isDark} onChange={onChange}>
        {textToCapital(theme || "").concat(" Mode")}
      </Switch>
    );

  return (
    <SwitchAutoLabel
      {...switchProps}
      isSelected={isDark}
      onChange={onChange}
      label={textToCapital(theme || "").concat(" Mode")}
      disableLabel={disableLabel}
    />
  );
};
