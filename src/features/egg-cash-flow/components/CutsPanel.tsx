import { formatCurrency, formatDate } from "../utils/cashFlow.utils";
import type { CashFlowCut } from "../types/eggCashFlow.types";

interface Props {
  cuts: CashFlowCut[];
}

export default function CutsPanel({ cuts }: Props) {
  if (cuts.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <h3 className="text-base font-semibold text-white">Cortes de semana</h3>
        <p className="mt-1 text-sm text-slate-400">
          No hay cortes registrados. Usa "Corte de semana" para cerrar el
          periodo actual.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70">
      <div className="border-b border-slate-800 px-5 py-4">
        <h3 className="text-base font-semibold text-white">Cortes de semana</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Semana</th>
              <th className="px-5 py-3 text-right font-semibold">Caja chica</th>
              <th className="px-5 py-3 text-right font-semibold">
                Caja general
              </th>
              <th className="px-5 py-3 text-right font-semibold">Deuda</th>
              <th className="px-5 py-3 text-right font-semibold">Saldo real</th>
              <th className="px-5 py-3 text-right font-semibold">Diferencia</th>
              <th className="px-5 py-3 font-semibold">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {cuts.map((c) => (
              <tr key={c.id} className="transition hover:bg-slate-900/50">
                <td className="px-5 py-3 text-sm whitespace-nowrap text-slate-300">
                  {formatDate(c.weekStart)} — {formatDate(c.weekEnd)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-white">
                  {formatCurrency(c.cashClosingBalance)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-white">
                  {formatCurrency(c.bankClosingBalance)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-amber-400">
                  {formatCurrency(c.remesaDebtTotal)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-slate-300">
                  {c.realBankBalance != null
                    ? formatCurrency(c.realBankBalance)
                    : "—"}
                </td>
                <td
                  className={`px-5 py-3 text-right font-mono text-sm ${
                    c.bankDifference == null
                      ? "text-slate-500"
                      : c.bankDifference >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                  }`}
                >
                  {c.bankDifference != null
                    ? formatCurrency(c.bankDifference)
                    : "—"}
                </td>
                <td className="px-5 py-3 text-sm text-slate-400">
                  {c.note ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
