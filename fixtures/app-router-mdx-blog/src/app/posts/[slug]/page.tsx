import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POSTS } from "@/content/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.summary, alternates: { canonical: `/posts/${slug}` } } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  const { default: Body } = await import(`@/content/posts/${slug}.mdx`);
  return (
    <main>
      <article>
        <h1>{post.title}</h1>
        <Body />
      </article>
    </main>
  );
}
