// Single source of truth for plan pricing (BDT / month).
// The frontend displays these amounts, but checkout ALWAYS uses these
// server-side values — the client never sends an amount.
export const PLANS = {
  OWNER: { label: "Owner", amount: 499, durationDays: 30 },
  MANAGER: { label: "Manager", amount: 299, durationDays: 30 },
} as const;

export type PlanKey = keyof typeof PLANS;
export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];
