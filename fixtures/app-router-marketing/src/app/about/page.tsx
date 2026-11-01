import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Tidynote and the small team behind it",
  description: "Tidynote is made by a team of four in Amsterdam. We are independent, profitable and funded by our customers, not by advertising or investors.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <h1>About us</h1>
      <p>We are four people in Amsterdam who got tired of losing notes.</p>
      <p>Tidynote has been independent since 2023. We make money from subscriptions only, so your notes are never the product.</p>
      <img src="/team.svg" alt="The Tidynote team at their office" width={320} height={180} />
    </>
  );
}
