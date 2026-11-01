import Link from "next/link";
import type { GetStaticProps } from "next";
import { Layout } from "@/components/Layout";
import { RECIPES, type Recipe } from "@/data/recipes";

export const getStaticProps: GetStaticProps<{ recipes: Recipe[] }> = async () => ({ props: { recipes: RECIPES } });

export default function Home({ recipes }: { recipes: Recipe[] }) {
  return (
    <Layout
      title="Quickplate: simple recipes for busy weeknights"
      description="Quickplate collects simple, tested recipes you can cook on a weeknight. Every recipe lists its time, servings and steps, with no life story first."
      path="/"
    >
      <h1>Dinner, sorted</h1>
      <p>Tested recipes that fit into a normal evening. We currently have {recipes.length} recipes, and we add a new one every week.</p>
      <ul>
        {recipes.map((r) => (
          <li key={r.slug}>
            <Link href={`/recipes/${r.slug}`}>{r.title}</Link> — {r.minutes} minutes
          </li>
        ))}
      </ul>
    </Layout>
  );
}
