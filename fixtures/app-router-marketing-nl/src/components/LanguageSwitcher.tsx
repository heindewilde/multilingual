"use client";

import type { Locale } from "next-intl";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Each language's name in that language. */
const LABELS: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

/**
 * Links to the same page in every other language. The href comes from getPathname, the same
 * function that builds the hreflang alternates, so the switcher and search engines agree
 * (the source locale stays unprefixed). A plain <a> reloads the page so <html lang> updates.
 */
export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const current = useLocale();
  const pathname = usePathname();
  if (routing.locales.length < 2) return null;
  return (
    <nav aria-label={t("label")}>
      <ul>
        {routing.locales.map((locale) => (
          <li key={locale}>
            {locale === current ? (
              <span lang={locale} aria-current="true">{LABELS[locale]}</span>
            ) : (
              <a href={getPathname({ locale, href: pathname })} lang={locale} hrefLang={locale}>
                {LABELS[locale]}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
