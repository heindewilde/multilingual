import { Layout } from "@/components/Layout";

export default function About() {
  return (
    <Layout
      title="About Quickplate"
      description="Quickplate is written by two home cooks in Bristol who test every recipe on a normal weeknight, in a normal kitchen, with normal shops."
      path="/about"
    >
      <h1>About Quickplate</h1>
      <p>We are two home cooks in Bristol. Every recipe is cooked at least 3 times before it goes online.</p>
      <p>Spotted a mistake? Email recipes@quickplate.example.</p>
    </Layout>
  );
}
