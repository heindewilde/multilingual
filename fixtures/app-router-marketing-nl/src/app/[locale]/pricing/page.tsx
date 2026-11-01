import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { localeAlternates } from "@/i18n/metadata";
import { PLANS } from "@/content/plans";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "PricingPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...(await localeAlternates(locale as Locale, "/pricing")),
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // validated by the layout
  const t = await getTranslations("PricingPage");
  return (
    <>
      <h1>{t("title")}</h1>
      <p>{t("intro")}</p>
      <div>
        {PLANS.map((plan) => (
          <article key={plan.id}>
            <h2>{plan.name}</h2>
            <p>{t("price", { price: plan.priceUsd })}</p>
            <p>{t("seats", { seats: plan.seats })}</p>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{t(`features.${f}`)}</li>
              ))}
            </ul>
            <button type="button" title={t("trialTitle", { plan: plan.name })}>{t("trialCta")}</button>
          </article>
        ))}
      </div>
    </>
  );
}
