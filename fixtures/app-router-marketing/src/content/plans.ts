export type Plan = { id: string; name: string; priceUsd: number; seats: number; features: string[] };

export const PLANS: Plan[] = [
  { id: "starter", name: "Starter", priceUsd: 9, seats: 1, features: ["Unlimited notes", "Sync across 2 devices", "Email support"] },
  { id: "team", name: "Team", priceUsd: 29, seats: 5, features: ["Everything in Starter", "Shared workspaces", "Priority support"] },
  { id: "business", name: "Business", priceUsd: 79, seats: 20, features: ["Everything in Team", "SSO", "Audit log"] },
];
