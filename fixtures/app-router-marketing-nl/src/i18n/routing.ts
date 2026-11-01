import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl"],
  defaultLocale: "en",
  localePrefix: "as-needed", // /pricing stays /pricing; other locales get /<code>/pricing
  localeDetection: false, // no redirect by Accept-Language or cookie
  alternateLinks: false, // hreflang lives in the HTML head and the sitemap
});
