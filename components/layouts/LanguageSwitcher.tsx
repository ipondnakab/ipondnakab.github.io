"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

import { SupportedLanguage } from "@/i18n/config";

interface LanguageOption {
  code: SupportedLanguage;
  short: string;
  label: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", short: "EN", label: "English", flag: "/images/uk-flag.png" },
  { code: "th", short: "TH", label: "ไทย", flag: "/images/th-flag.png" },
  { code: "ja", short: "JP", label: "日本語", flag: "/images/jp-flag.png" },
  { code: "sv", short: "SE", label: "Svenska", flag: "/images/se-flag.png" },
  { code: "zh", short: "CN", label: "中文", flag: "/images/cn-flag.png" },
];

const FlagIcon: React.FC<{ src: string; size?: number }> = ({
  src,
  size = 22,
}) => (
  <Image
    src={src}
    alt=""
    radius="none"
    width={size}
    height={Math.round((size * 2) / 3)}
    className="object-cover shadow-sm"
  />
);

const LanguageSwitcher: React.FC = () => {
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
          size="sm"
          variant="flat"
          aria-label={t("switches.language")}
          className="min-w-6 w-6 h-6 p-0 text-[10px] font-bold"
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
