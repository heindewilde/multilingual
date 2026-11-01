import type { MetadataRoute } from "next";
import type { Locale } from "next-intl";
import { getPosts } from "@/lib/posts";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const host = "https://tidynote.example";

const url = (locale: Locale, href: string) => {
  const path = getPathname({ locale, href });
  return host + (path === "/" ? "" : path);
};

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = new Set(routing.locales.flatMap((locale) => getPosts(locale).map((p) => p.slug)));
  const pages: { href: string; locales: readonly Locale[] }[] = [
    ...["/", "/pricing", "/about", "/blog"].map((href) => ({ href, locales: routing.locales })),
    ...[...slugs].map((slug) => ({
      href: `/blog/${slug}`,
      locales: routing.locales.filter((locale) => getPosts(locale).some((p) => p.slug === slug)),
    })),
  ];
  return pages.flatMap(({ href, locales }) =>
    locales.map((locale) => ({
      url: url(locale, href),
      ...(routing.locales.length > 1 && {
        alternates: {
          languages: {
            ...Object.fromEntries(locales.map((l) => [l, url(l, href)])),
            ...(locales.includes(routing.defaultLocale) && { "x-default": url(routing.defaultLocale, href) }),
          },
        },
      }),
    })),
  );
}
