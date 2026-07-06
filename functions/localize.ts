import { LocalizedText } from "@/interfaces/localized-text";

// Resolve a LocalizedText to the active language, falling back to English when
// that language has no translation for the entry.
export const localize = (text: LocalizedText, lang: string): string => {
  const code = lang.split("-")[0] as keyof LocalizedText;
  return text[code] ?? text.en;
};

// Resolve a single or list of LocalizedText, preserving the shape.
export const localizeText = (
  text: LocalizedText | LocalizedText[],
  lang: string,
): string | string[] =>
  Array.isArray(text)
    ? text.map((item) => localize(item, lang))
    : localize(text, lang);
