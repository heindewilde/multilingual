import type { Metadata } from "next";
import { PLANS } from "@/content/plans";

export const metadata: Metadata = {
  title: "Pricing: simple plans for every team size",
  description: "Compare Tidynote plans. Starter costs $9 a month for one person, Team $29 for five, and Business $79 for twenty, all with unlimited notes.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <h1>Simple, honest pricing</h1>
      <p>Every plan includes unlimited notes. Cancel any time.</p>
      <div>
        {PLANS.map((plan) => (
          <article key={plan.id}>
            <h2>{plan.name}</h2>
            <p>${plan.priceUsd} per month</p>
            <p>{plan.seats === 1 ? "For 1 person" : `For up to ${plan.seats} people`}</p>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button type="button" title={`Start a free trial of ${plan.name}`}>Start free trial</button>
          </article>
        ))}
      </div>
    </>
  );
}
