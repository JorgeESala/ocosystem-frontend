import { formatMXN } from "@/utils/moneyNumbers";
import type { CashFlowSummary } from "../types/eggCashFlow.types";

interface Props {
  summary: CashFlowSummary | undefined;
  rangeLabel: string;
  accountHolder: string;
}

function Row({
  label,
  amount,
  bold,
  color,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  color?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${
        bold ? "border-t border-slate-700 pt-2 font-semibold" : ""
      }`}
    >
      <span className={bold ? "text-white" : "text-slate-400"}>{label}</span>
      <span
        className={`font-mono ${color ?? (bold ? "text-white" : "text-slate-300")}`}
      >
        {formatMXN(amount)}
      </span>
    </div>
  );
}

export default function WeeklySummaryCard({
  summary,
  rangeLabel,
  accountHolder,
}: Props) {
  if (!summary) return null;

  const cashBeforeDeposit =
    summary.cashOpeningBalance +
    summary.totalIncome -
    summary.totalCashExpenses -
    summary.totalCashRemesaPayments +
    summary.totalCashAdjustments;

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Resumen
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Flujo de efectivo {rangeLabel}
          </h2>
        </div>
        {summary.closed && (
          <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-300">
            Semana cerrada
          </span>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-amber-400">
            Efectivo en oficina
          </h3>
          <Row label="Apertura" amount={summary.cashOpeningBalance} />
          <Row
            label="+ Cobranza"
            amount={summary.totalIncome}
            color="text-emerald-400"
          />
          <Row
            label="− Gastos en efectivo"
            amount={summary.totalCashExpenses}
            color="text-red-400"
          />
          <Row
            label="− Pago de remesas"
            amount={summary.totalCashRemesaPayments}
            color="text-red-400"
          />
          <Row label="± Ajustes" amount={summary.totalCashAdjustments} />
          <Row label="= Antes de depósito" amount={cashBeforeDeposit} bold />
          <Row
            label="− Ingreso a cuenta"
            amount={summary.totalDeposits}
            color="text-blue-400"
          />
          <Row
            label="= Efectivo en oficina (cierre)"
            amount={summary.cashClosingBalance}
            bold
          />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-blue-400">
            Banco · cuenta de {accountHolder}
          </h3>
          <Row label="Corte anterior" amount={summary.bankOpeningBalance} />
          <Row
            label="+ Cobranza directa al banco"
            amount={summary.totalBankIncome}
            color="text-emerald-400"
          />
          <Row
            label="+ Ingreso a cuenta"
            amount={summary.totalDeposits}
            color="text-emerald-400"
          />
          <Row
            label="− Pago de remesas"
            amount={summary.totalRemesaPayments}
            color="text-red-400"
          />
          <Row label="± Ajustes" amount={summary.totalBankAdjustments} />
          <Row
            label="= Corte de semana"
            amount={summary.bankClosingBalance}
            bold
          />
          <Row
            label="Deuda con remesas"
            amount={summary.remesaDebtTotal}
            color="text-amber-400"
          />
          {summary.realBankBalance != null && (
            <>
              <Row
                label="Saldo real (cuenta)"
                amount={summary.realBankBalance}
              />
              <Row
                label="Diferencia"
                amount={summary.realBankBalance - summary.bankClosingBalance}
                color={
                  summary.realBankBalance - summary.bankClosingBalance >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
