import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { routing } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/posts";
import { Markdown } from "@/lib/markdown";

export function generateStaticParams({ params }: { params: { locale: string } }) {
  return getPosts(params.locale).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};
  const available = routing.locales.filter((l) => getPost(l, slug));
  return { title: post.title, description: post.description, ...(await localeAlternates(locale as Locale, `/blog/${slug}`, available)) };
}

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale); // validated by the layout
  const post = getPost(locale, slug);
  if (!post) notFound();
  return (
    <article>
      <h1>{post.title}</h1>
      <Markdown source={post.body} />
    </article>
  );
}
