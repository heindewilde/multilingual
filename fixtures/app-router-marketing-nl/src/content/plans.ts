/**
 * Plan data. Prices, seats and IDs live here once for every locale; the feature labels are
 * translated in messages/<locale>.json under PricingPage.features.<key>.
 */
export type FeatureKey =
  | "unlimitedNotes"
  | "syncTwoDevices"
  | "emailSupport"
  | "everythingInStarter"
  | "sharedWorkspaces"
  | "prioritySupport"
  | "everythingInTeam"
  | "sso"
  | "auditLog";

export type Plan = { id: string; name: string; priceUsd: number; seats: number; features: FeatureKey[] };

export const PLANS: Plan[] = [
  { id: "starter", name: "Starter", priceUsd: 9, seats: 1, features: ["unlimitedNotes", "syncTwoDevices", "emailSupport"] },
  { id: "team", name: "Team", priceUsd: 29, seats: 5, features: ["everythingInStarter", "sharedWorkspaces", "prioritySupport"] },
  { id: "business", name: "Business", priceUsd: 79, seats: 20, features: ["everythingInTeam", "sso", "auditLog"] },
];
