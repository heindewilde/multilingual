import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://tidynote.example"),
  title: "Tidynote: fast notes that stay organised",
  description: "Tidynote is a note-taking app that is as fast as plain text and as organised as a database. Free for one device, from $9 a month for more.",
  alternates: { canonical: "/" },
  openGraph: { locale: "en_US", siteName: "Tidynote" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
