import Link from "next/link";

export function Header() {
  return (
    <header>
      <Link href="/" aria-label="Tidynote home">Tidynote</Link>
      <nav>
        <Link href="/pricing">Pricing</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/about">About us</Link>
      </nav>
    </header>
  );
}
