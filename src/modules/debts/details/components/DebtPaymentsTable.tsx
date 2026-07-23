"use client";

import { useTranslation } from "react-i18next";

import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";

import type { DebtPayment } from "../../types";

type DebtPaymentsTableProps = {
  payments: DebtPayment[];
  currency: string;
  onSelectPayment?: (payment: DebtPayment) => void;
};

export function DebtPaymentsTable({
  payments,
  currency,
  onSelectPayment,
}: DebtPaymentsTableProps) {
  const { t, i18n } = useTranslation();

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-headline text-base font-semibold text-text-main">
          {t("debts.paymentHistory")}
        </h2>
      </div>

      {payments.length === 0 ? (
        <p className="p-5 text-center text-sm text-text-secondary">
          {t("debts.noPaymentsYet")}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-xs text-text-secondary">
                  <th className="px-4 py-3 font-medium">
                    {t("debts.paymentDateColumn")}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    {t("debts.interest")}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    {t("debts.amortizationCapital")}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    {t("debts.totalPaid")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    {t("debts.statusColumn")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const clickable = Boolean(onSelectPayment);
                  return (
                    <tr
                      key={payment.id}
                      className={
                        clickable
                          ? "cursor-pointer border-b border-border last:border-b-0 hover:bg-surface-muted/60"
                          : "border-b border-border last:border-b-0 hover:bg-surface-muted/60"
                      }
                      onClick={() => onSelectPayment?.(payment)}
                      onKeyDown={
                        clickable
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onSelectPayment?.(payment);
                              }
                            }
                          : undefined
                      }
                      tabIndex={clickable ? 0 : undefined}
                      role={clickable ? "button" : undefined}
                    >
                      <td className="px-4 py-3 text-text-main">
                        {formatShortDate(payment.paymentDate, i18n.language)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        {formatMoney(payment.interestAmount, currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        {formatMoney(payment.amortizationAmount, currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-text-main">
                        {formatMoney(payment.totalAmount, currency)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded bg-success/15 px-2 py-0.5 text-[11px] font-bold tracking-wide text-success uppercase">
                          {t("debts.statusPaid")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-text-secondary">
              {t("debts.showingPayments", { count: payments.length })}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
