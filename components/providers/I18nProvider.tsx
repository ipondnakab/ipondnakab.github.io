"use client";

import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

import i18n, {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/i18n/config";

export interface I18nProviderProps {
  children: React.ReactNode;
}

const isSupported = (value: string | null): value is SupportedLanguage =>
  value !== null && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);

const detectLanguage = (): SupportedLanguage => {
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupported(stored)) return stored;
  const navLang = navigator.language?.toLowerCase() ?? "";
  const matched = SUPPORTED_LANGUAGES.find((lng) => navLang.startsWith(lng));
  return matched ?? DEFAULT_LANGUAGE;
};

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  // The site is exported statically (GitHub Pages) and always prerendered in
  // the default language. If the visitor's language differs, we must never let
  // a subtree hydrate in that language against the default-language HTML — that
  // throws a hydration mismatch (and it bites hardest behind Suspense
  // boundaries, which hydrate lazily). So we key the subtree by language: it
  // first hydrates in the default language (matching the HTML), then remounts
  // as a fresh client render, and only after that do we switch languages. The
  // post-switch render is a new client mount, so React never diffs it against
  // the server HTML. This is safe here because there is no real SSR to preserve.
  const [renderKey, setRenderKey] =
    useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  // On mount, detect the preferred language and — only if it differs from the
  // prerendered one — trigger the remount. Language is NOT changed yet, so the
  // remounted tree is still in the default language (no hydration in flight).
  useEffect(() => {
    const target = detectLanguage();
    document.documentElement.lang = target;

    const handleLanguageChanged = (lng: string) => {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      document.documentElement.lang = lng;
    };
    i18n.on("languageChanged", handleLanguageChanged);

    if (target !== i18n.language) setRenderKey(target);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  // Apply the language only after the fresh (non-hydrating) client remount.
  // Manual switches later go straight through i18n.changeLanguage and re-render
  // in place (renderKey stays put), so they never remount / reset page state.
  useEffect(() => {
    if (renderKey !== i18n.language) i18n.changeLanguage(renderKey);
  }, [renderKey]);

  return (
    <I18nextProvider i18n={i18n}>
      <React.Fragment key={renderKey}>{children}</React.Fragment>
    </I18nextProvider>
  );
};

export default I18nProvider;
