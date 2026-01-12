"use client";

import { useParams } from "next/navigation";
import { getTranslations, type Locale } from "lib/i18n";

export function useLocaleClient() {
  const params = useParams();
  const locale = (params?.locale as Locale) ?? "ja";
  const t = getTranslations(locale);
  return { locale, t };
}
