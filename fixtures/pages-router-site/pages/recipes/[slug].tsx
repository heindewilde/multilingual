import type { GetStaticPaths, GetStaticProps } from "next";
import { Layout } from "@/components/Layout";
import { RECIPES, type Recipe } from "@/data/recipes";

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: RECIPES.map((r) => ({ params: { slug: r.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ recipe: Recipe }> = async ({ params }) => {
  const recipe = RECIPES.find((r) => r.slug === params?.slug);
  return recipe ? { props: { recipe } } : { notFound: true };
};

export default function RecipePage({ recipe }: { recipe: Recipe }) {
  return (
    <Layout title={recipe.title} description={recipe.summary} path={`/recipes/${recipe.slug}`}>
      <h1>{recipe.title}</h1>
      <p>{recipe.summary}</p>
      <p>{recipe.servings === 1 ? "Serves 1" : `Serves ${recipe.servings}`} · Ready in {recipe.minutes} minutes</p>
      <h2>Method</h2>
      <ol>
        {recipe.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </Layout>
  );
}
