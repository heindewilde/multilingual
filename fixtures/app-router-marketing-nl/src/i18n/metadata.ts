import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "./routing";
import { getPathname } from "./navigation";

/** og:locale per locale (regional form, from .claude/multilingual/locales/<code>.md). */
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  nl: "nl_NL",
};

/**
 * Canonical, hreflang alternates (incl. x-default) and Open Graph locale for one internal path.
 * Pass `available` when the page exists only in some locales (e.g. a post not yet translated).
 */
export async function localeAlternates(
  locale: Locale,
  href: string,
  available: readonly Locale[] = routing.locales,
): Promise<Pick<Metadata, "alternates" | "openGraph">> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const languages: Record<string, string> = Object.fromEntries(available.map((l) => [l, getPathname({ locale: l, href })]));
  if (available.includes(routing.defaultLocale)) {
    languages["x-default"] = getPathname({ locale: routing.defaultLocale, href });
  }
  return {
    alternates: { canonical: getPathname({ locale, href }), languages },
    openGraph: {
      locale: OG_LOCALE[locale],
      alternateLocale: available.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      siteName: t("siteName"),
    },
  };
}
