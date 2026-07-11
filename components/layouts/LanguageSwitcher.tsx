"use client";

import { LANGUAGE_OPTIONS } from "@/constants/languages";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import FlagIcon from "./FlagIcon";

export interface LanguageSwitcherProps {
  // Optional props can be added here if needed in the future
  size?: "sm" | "md" | "lg";
  buttonClassName?: string; // Optional className for the button
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  size = "sm",
  buttonClassName,
}) => {
  const { t, i18n } = useTranslation();
  const langCode = i18n.language.split("-")[0];
  const current =
    LANGUAGE_OPTIONS.find((option) => option.code === langCode) ??
    LANGUAGE_OPTIONS[0];

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          radius="full"
          size={size}
          variant="flat"
          aria-label={t("switches.language")}
          className={buttonClassName}
        >
          {current.short}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t("switches.language")}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[current.code]}
        onAction={(key) => i18n.changeLanguage(String(key))}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownItem
            key={option.code}
            startContent={<FlagIcon src={option.flag} />}
          >
            {option.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
