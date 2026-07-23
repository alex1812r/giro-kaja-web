type PaymentAmortization = {
  id: string;
  paymentDate: string;
  amortizationAmount: number;
};

/**
 * Principal remaining after a given payment, walking chronologically from initial amount.
 */
export function principalRemainingAfterPayment(
  initialAmount: number,
  payments: PaymentAmortization[],
  paymentId: string,
): number {
  const ordered = [...payments].sort((a, b) =>
    a.paymentDate.localeCompare(b.paymentDate),
  );

  let remaining = initialAmount;
  for (const payment of ordered) {
    remaining = Math.max(0, remaining - payment.amortizationAmount);
    if (payment.id === paymentId) {
      return remaining;
    }
  }

  return Math.max(0, remaining);
}
