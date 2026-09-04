export const ESTIMATE_APR = 6.9;
export const ESTIMATE_TERM_MONTHS = 60;
export const ESTIMATE_DOWN_PERCENT = 0.3;

/** "Starting at" monthly payment shown on listing cards, using standard assumptions. */
export function estimateListingPayment(price: number): number {
  const down = price * ESTIMATE_DOWN_PERCENT;
  return monthlyPayment(price - down, ESTIMATE_APR, ESTIMATE_TERM_MONTHS);
}

export function monthlyPayment(
  principal: number,
  apr: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export type Condition = "Excellent" | "Good" | "Fair";

const CONDITION_MULTIPLIER: Record<Condition, number> = {
  Excellent: 1,
  Good: 0.88,
  Fair: 0.72,
};

/**
 * Rough, deterministic trade-in estimate for demo purposes only.
 * Real offers are determined by an in-person appraisal.
 */
export function estimateTradeInRange(input: {
  year: number;
  mileage: number;
  condition: Condition;
}): { low: number; high: number } {
  const age = Math.max(0, new Date().getFullYear() - input.year);
  const base = 32000 - age * 1450;
  // Assumes mileage in kilometers (~19,000 km/year is a typical baseline).
  const mileagePenalty = Math.max(0, input.mileage - 19000 * age) * 0.028;
  const adjusted = Math.max(1200, base - mileagePenalty) * CONDITION_MULTIPLIER[input.condition];

  const low = Math.round((adjusted * 0.92) / 50) * 50;
  const high = Math.round((adjusted * 1.08) / 50) * 50;
  return { low, high };
}
