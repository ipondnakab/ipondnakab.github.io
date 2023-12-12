"use client";

import { textToCapital } from "@/functions/text-to-capital";
import { Skeleton } from "@nextui-org/react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import SwitchAutoLabel from "../Switch/SwitchAutoLabel";

export interface ThemeSwitcherProps {
  disableLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  disableLabel,
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

  return (
    <SwitchAutoLabel
      size="sm"
      color="default"
      startContent={<FaMoon />}
      endContent={<FaSun />}
      value={theme}
      checked={isChecked}
      defaultSelected={isChecked}
      onChange={onChange}
      className="group"
      label={textToCapital(theme || "").concat(" Mode")}
      disableLabel={disableLabel}
    />
  );
};
