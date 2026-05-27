import { formatMXN } from "@/utils/moneyNumbers";
import type { CashSummaryItem } from "../utils/profit-summary";

interface Props {
  items: CashSummaryItem[];
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export default function BranchProfitCashBreakdown({ items }: Props) {
  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Efectivo por unidad de negocio
          </h3>
          <p className="text-sm text-slate-400">
            Ventas, gastos y efectivo esperado agrupados por unidad.
          </p>
        </div>
        <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          Ordenado por efectivo esperado
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
          No hay datos por unidad de negocio para el filtro actual.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Unidad</th>
                <th className="px-4 py-3 font-semibold">Ventas</th>
                <th className="px-4 py-3 font-semibold">Gastos</th>
                <th className="px-4 py-3 font-semibold">Efectivo esperado</th>
                <th className="px-4 py-3 font-semibold">% caja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {items.map((item) => (
                <tr key={item.label} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{item.label}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-100">
                    {formatMXN(item.totalSales)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-100">
                    {formatMXN(item.totalExpenses)}
                  </td>
                  <td className="px-4 py-3 font-mono text-cyan-300">
                    {formatMXN(item.expectedCash)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatPercent(item.percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

