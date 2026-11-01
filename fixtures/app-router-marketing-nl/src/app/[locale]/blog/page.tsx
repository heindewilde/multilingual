import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { localeAlternates } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/posts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "BlogPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...(await localeAlternates(locale as Locale, "/blog")),
  };
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // validated by the layout
  const t = await getTranslations("BlogPage");
  const format = await getFormatter();
  const posts = getPosts(locale);
  return (
    <>
      <h1>{t("title")}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            <p>{post.description}</p>
            <time dateTime={post.date}>{format.dateTime(new Date(post.date + "T12:00:00Z"), { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time>
          </li>
        ))}
      </ul>
    </>
  );
}
