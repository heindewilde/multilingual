import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://goldenhour.example"),
  title: "Golden Hour: notes on everyday photography",
  description: "Golden Hour is a small blog about everyday photography: light, lenses and walking around with a camera. New posts roughly once a month.",
  openGraph: { locale: "en_US" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <Link href="/">Golden Hour</Link>
        </header>
        {children}
        <footer>Photos and words by the author. Please ask before reusing them.</footer>
      </body>
    </html>
  );
}
