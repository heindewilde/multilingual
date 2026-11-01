import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/posts";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // validated by the layout
  const t = await getTranslations("HomePage");
  const posts = getPosts(locale);
  return (
    <>
      <section>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
        <Link href="/pricing">{t("cta")}</Link>
      </section>
      <section>
        <h2>{t("whyTitle")}</h2>
        <ul>
          <li>{t("reasons.speed")}</li>
          <li>{t("reasons.offline")}</li>
          <li>{t("reasons.export")}</li>
        </ul>
      </section>
      <section>
        <h2>{t("blogTitle")}</h2>
        <p>{t("articleCount", { count: posts.length })}</p>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
