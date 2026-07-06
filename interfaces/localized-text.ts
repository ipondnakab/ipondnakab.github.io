// A string that carries its supported translations. Used for structured content
// (e.g. résumé data) that lives in constants rather than the i18n locale files.
// `en` is required and acts as the fallback; other languages are optional and
// fall back to English when missing (see functions/localize).
export interface LocalizedText {
  en: string;
  th?: string;
  ja?: string;
  sv?: string;
  zh?: string;
}
