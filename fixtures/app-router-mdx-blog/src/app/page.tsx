import Link from "next/link";
import { POSTS } from "@/content/posts";

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export default function Home() {
  return (
    <main>
      <h1>Notes on everyday photography</h1>
      <p>Short essays about light, gear and seeing. {POSTS.length} posts so far.</p>
      <ul>
        {POSTS.map((p) => (
          <li key={p.slug}>
            <Link href={`/posts/${p.slug}`}>{p.title}</Link>
            <p>{p.summary}</p>
            <small>
              {formatDate(p.published)} · {p.readingMinutes === 1 ? "1 minute read" : `${p.readingMinutes} minute read`}
            </small>
          </li>
        ))}
      </ul>
    </main>
  );
}
