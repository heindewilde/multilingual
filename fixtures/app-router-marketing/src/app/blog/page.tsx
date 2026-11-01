import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tidynote blog: product updates and how we work",
  description: "Read how we build Tidynote, why we make the choices we do, and what changed in each release. New articles every couple of weeks, no fluff.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            <p>{post.description}</p>
            <time dateTime={post.date}>{new Date(post.date + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time>
          </li>
        ))}
      </ul>
    </>
  );
}
