import en from '@/messages/en.json';

/**
 * Persisted on the lead as `plan` — these strings must stay identical to the
 * backend's `AssistantRequestPlan` enum or the POST fails validation.
 */
export type AssistancePlanId = 'three_months' | 'six_months';

type AssistantServiceKey = keyof typeof en.assistantService;

export interface AssistancePlan {
  id: AssistancePlanId;
  labelKey: AssistantServiceKey;
  priceKey: AssistantServiceKey;
  /** Numeric form of the formatted amount behind `priceKey`, for schema.org Offer markup. */
  price: number;
}

// Shared by the page (which renders the cards through `t()`) and the layout
// (which feeds the JSON-LD offers), so a pricing change can never land in the
// visible cards without also moving the structured data.
export const ASSISTANCE_PLANS: AssistancePlan[] = [
  { id: 'three_months', labelKey: 'plan3MonthsLabel', priceKey: 'plan3MonthsPrice', price: 20000 },
  { id: 'six_months', labelKey: 'plan6MonthsLabel', priceKey: 'plan6MonthsPrice', price: 30000 },
];
