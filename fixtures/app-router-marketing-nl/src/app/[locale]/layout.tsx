import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    metadataBase: new URL("https://tidynote.example"),
    title: t("title"),
    description: t("description"),
    ...(await localeAlternates(locale, "/")),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Client components only need these namespaces; server components read the full catalogue.
  const messages = await getMessages();
  const clientMessages = { LanguageSwitcher: messages.LanguageSwitcher };
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={clientMessages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
