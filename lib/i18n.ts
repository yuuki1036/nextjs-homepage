import en from "./locales/en";
import ja from "./locales/ja";

export const locales = ["ja", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ja";

export function getTranslations(locale: string | undefined) {
  return locale === "en" ? en : ja;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
