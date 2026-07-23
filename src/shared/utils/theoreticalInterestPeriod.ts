/**
 * Un periodo de interés — alineado con la app móvil y
 * `supabase/scripts/query_loans_theoretical_interest_totals.sql`.
 *
 *   ganancia_periodo = initial_amount * (interest_rate / 100)
 *   total_periodo    = initial_amount * (1 + interest_rate / 100)
 */

export function theoreticalInterestOnePeriod(
  initialAmount: number,
  interestRatePercent: number,
): number {
  return initialAmount * (interestRatePercent / 100);
}

export function theoreticalPrincipalPlusInterestOnePeriod(
  initialAmount: number,
  interestRatePercent: number,
): number {
  return initialAmount * (1 + interestRatePercent / 100);
}
