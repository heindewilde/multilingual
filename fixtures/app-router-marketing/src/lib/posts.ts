import fs from "node:fs";
import path from "node:path";

export type Post = { slug: string; title: string; description: string; date: string; body: string };

const DIR = path.join(process.cwd(), "src/content/blog");

function parse(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = Object.fromEntries(
    (match?.[1] ?? "").split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
  );
  return { slug: file.replace(/\.md$/, ""), title: meta.title, description: meta.description, date: meta.date, body: match?.[2] ?? raw };
}

export function getPosts(): Post[] {
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).map(parse).sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}
