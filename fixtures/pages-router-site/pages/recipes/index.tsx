import Link from "next/link";
import type { GetStaticProps } from "next";
import { Layout } from "@/components/Layout";
import { RECIPES, type Recipe } from "@/data/recipes";

export const getStaticProps: GetStaticProps<{ recipes: Recipe[] }> = async () => ({ props: { recipes: RECIPES } });

export default function Recipes({ recipes }: { recipes: Recipe[] }) {
  return (
    <Layout
      title="All Quickplate recipes"
      description="Browse every Quickplate recipe, from fifteen-minute pastas to slow Sunday soups. Each one has been cooked at least three times before we publish it."
      path="/recipes"
    >
      <h1>All recipes</h1>
      {recipes.map((r) => (
        <article key={r.slug}>
          <h2><Link href={`/recipes/${r.slug}`}>{r.title}</Link></h2>
          <p>{r.summary}</p>
          <p>Serves {r.servings} · {r.minutes} minutes</p>
        </article>
      ))}
    </Layout>
  );
}
