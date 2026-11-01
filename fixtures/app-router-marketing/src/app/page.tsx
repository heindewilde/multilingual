import Link from "next/link";
import { getPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getPosts();
  return (
    <>
      <section>
        <h1>Notes that keep up with you</h1>
        <p>Write as fast as you think. Tidynote files every note where you will find it again, without folders to manage.</p>
        <Link href="/pricing">See plans and pricing</Link>
      </section>
      <section>
        <h2>Why people switch</h2>
        <ul>
          <li>Opens in under 1 second, even with 10,000 notes</li>
          <li>Works offline and syncs when you are back</li>
          <li>Your notes stay yours: export everything as Markdown</li>
        </ul>
      </section>
      <section>
        <h2>From the blog</h2>
        <p>{posts.length === 1 ? "1 article" : `${posts.length} articles`} about how we build Tidynote.</p>
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
