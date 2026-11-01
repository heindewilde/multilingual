import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const year = 2026;
  return (
    <footer>
      <p>{t("copyright", { year: String(year) })}</p>
      <p>{t("contact", { email: "hello@tidynote.example" })}</p>
    </footer>
  );
}
