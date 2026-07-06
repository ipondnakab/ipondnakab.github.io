import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import ja from "@/locales/ja.json";
import sv from "@/locales/sv.json";
import th from "@/locales/th.json";
import zh from "@/locales/zh.json";

export const SUPPORTED_LANGUAGES = ["en", "th", "ja", "sv", "zh"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
export const LANGUAGE_STORAGE_KEY = "i18nextLng";

// Resources are bundled (imported) rather than fetched, so translations are
// available synchronously — required for a static export with no server.
export const resources = {
  en: { translation: en },
  th: { translation: th },
  ja: { translation: ja },
  sv: { translation: sv },
  zh: { translation: zh },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    // Always initialise with the default language so the server-prerendered
    // HTML and the first client render match (no hydration mismatch). The real
    // language is applied after mount by I18nProvider.
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
