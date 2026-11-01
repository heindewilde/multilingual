import fs from "node:fs";
import path from "node:path";

export type Post = { slug: string; title: string; description: string; date: string; body: string };

/** Blog posts live in src/content/<locale>/blog/<slug>.md; the same slug is used in every locale. */
const dir = (locale: string) => path.join(process.cwd(), "src/content", locale, "blog");

function parse(locale: string, file: string): Post {
  const raw = fs.readFileSync(path.join(dir(locale), file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = Object.fromEntries(
    (match?.[1] ?? "").split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
  );
  return { slug: file.replace(/\.md$/, ""), title: meta.title, description: meta.description, date: meta.date, body: match?.[2] ?? raw };
}

export function getPosts(locale: string): Post[] {
  if (!fs.existsSync(dir(locale))) return [];
  return fs.readdirSync(dir(locale)).filter((f) => f.endsWith(".md")).map((f) => parse(locale, f)).sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(locale: string, slug: string): Post | undefined {
  return getPosts(locale).find((p) => p.slug === slug);
}
