import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { localeAlternates } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "AboutPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...(await localeAlternates(locale as Locale, "/about")),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // validated by the layout
  const t = await getTranslations("AboutPage");
  return (
    <>
      <h1>{t("title")}</h1>
      <p>{t("intro")}</p>
      <p>{t("independence")}</p>
      <img src="/team.svg" alt={t("teamImageAlt")} width={320} height={180} />
    </>
  );
}
