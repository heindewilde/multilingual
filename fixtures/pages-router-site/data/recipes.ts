export type Recipe = { slug: string; title: string; summary: string; minutes: number; servings: number; steps: string[] };

export const RECIPES: Recipe[] = [
  {
    slug: "tomato-soup",
    title: "Roasted tomato soup",
    summary: "A smooth soup made from oven-roasted tomatoes, garlic and a little cream. Ready in 45 minutes and better the next day.",
    minutes: 45,
    servings: 4,
    steps: ["Roast the tomatoes and garlic for 30 minutes.", "Blend with the stock until smooth.", "Stir in the cream and season to taste."],
  },
  {
    slug: "lemon-pasta",
    title: "Lemon and parmesan pasta",
    summary: "A five-ingredient weeknight pasta with lemon zest, butter and parmesan. On the table in 15 minutes with almost no washing up.",
    minutes: 15,
    servings: 2,
    steps: ["Cook the pasta in salted water.", "Melt the butter with the lemon zest.", "Toss everything with the parmesan and some pasta water."],
  },
];
