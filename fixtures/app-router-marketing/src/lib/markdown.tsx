import Link from "next/link";
import type { ReactNode } from "react";

/** A deliberately tiny Markdown renderer: headings, paragraphs, lists, links and code. */
function inline(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return m ? <Link key={i} href={m[2]}>{m[1]}</Link> : part;
  });
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("```")) return <pre key={i}><code>{block.replace(/^```\w*\n|```$/g, "")}</code></pre>;
        if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
        if (block.startsWith("- ")) return <ul key={i}>{block.split("\n").map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        return <p key={i}>{inline(block)}</p>;
      })}
    </>
  );
}
