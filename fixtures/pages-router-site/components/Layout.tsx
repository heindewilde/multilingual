import Head from "next/head";
import Link from "next/link";
import type { ReactNode } from "react";

export function Layout({ title, description, path, children }: { title: string; description: string; path: string; children: ReactNode }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://quickplate.example${path === "/" ? "" : path}`} />
        <meta property="og:locale" content="en_GB" />
      </Head>
      <header>
        <Link href="/">Quickplate</Link>
        <nav>
          <Link href="/recipes">All recipes</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>Quickplate: home cooking in under an hour.</p>
      </footer>
    </>
  );
}
