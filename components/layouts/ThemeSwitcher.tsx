"use client";

import { Skeleton, Switch, SwitchProps } from "@nextui-org/react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaMoon, FaSun } from "react-icons/fa";

import SwitchAutoLabel from "./SwitchAutoLabel";

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

// See SwitchAutoLabel: alias collapses NextUI's huge <Switch> prop union so the
// spread below stays within TypeScript's complexity budget (TS2590).
const BaseSwitch = Switch as unknown as React.FC<SwitchProps>;

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  disableLabel,
  disableLabelAnimation,
}) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === "dark");
  const themeLabel = isDark ? t("switches.darkMode") : t("switches.lightMode");

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
      <BaseSwitch {...switchProps} isSelected={isDark} onChange={onChange}>
        {themeLabel}
      </BaseSwitch>
    );

  return (
    <SwitchAutoLabel
      {...switchProps}
      isSelected={isDark}
      onChange={onChange}
      label={themeLabel}
      disableLabel={disableLabel}
    />
  );
};

export default ThemeSwitcher;
