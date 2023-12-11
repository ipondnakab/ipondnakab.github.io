"use client";

import { textToCapital } from "@/functions/text-to-capital";
import { Skeleton, Switch } from "@nextui-org/react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import clsx from "clsx";

export interface ThemeSwitcherProps {
  disableLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  disableLabel,
}) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isChecked, setIsChecked] = useState(theme === "dark");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    setIsChecked(theme === "dark");
  }, [theme]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("showText", showText);
  }, [showText]);

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
    <Switch
      onMouseOver={() => setShowText(true)}
      onMouseLeave={() => setShowText(false)}
      size="sm"
      color="default"
      startContent={<FaMoon />}
      endContent={<FaSun />}
      value={theme}
      defaultChecked={isChecked}
      checked={isChecked}
      onChange={onChange}
    >
      {!disableLabel && (
        <div
          className={clsx(
            "text-xs line-clamp-1 overflow-hidden w-0 transition-all delay-200",
            showText && "w-[64px]",
          )}
        >
          {textToCapital(theme || "").concat(" Mode")}
        </div>
      )}
    </Switch>
  );
};
