import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations("Header");
  return (
    <header>
      <Link href="/" aria-label={t("homeLabel")}>Tidynote</Link>
      <nav>
        <Link href="/pricing">{t("pricing")}</Link>
        <Link href="/blog">{t("blog")}</Link>
        <Link href="/about">{t("about")}</Link>
      </nav>
      <LanguageSwitcher />
    </header>
  );
}
