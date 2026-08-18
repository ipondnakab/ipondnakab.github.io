import { SupportedLanguage } from "@/i18n/config";

interface LanguageOption {
  code: SupportedLanguage;
  short: string;
  label: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", short: "EN", label: "English", flag: "/images/uk-flag.png" },
  { code: "th", short: "TH", label: "ไทย", flag: "/images/th-flag.png" },
  { code: "ja", short: "JP", label: "日本語", flag: "/images/jp-flag.png" },
  { code: "sv", short: "SE", label: "Svenska", flag: "/images/se-flag.png" },
  { code: "zh", short: "CN", label: "中文", flag: "/images/cn-flag.png" },
];
