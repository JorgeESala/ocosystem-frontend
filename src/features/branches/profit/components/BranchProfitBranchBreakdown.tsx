import { formatMXN } from "@/utils/moneyNumbers";
import type { ProfitSummaryItem } from "../utils/profit-summary";

interface Props {
  items: ProfitSummaryItem[];
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export default function BranchProfitBranchBreakdown({ items }: Props) {
  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Desglose por sucursal
          </h3>
          <p className="text-sm text-slate-400">
            Ventas y costo prorrateado agrupados por sucursal.
          </p>
        </div>
        <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          Ordenado por ventas
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
          No hay datos por sucursal para el filtro actual.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Sucursal</th>
                <th className="px-4 py-3 font-semibold">Remesas</th>
                <th className="px-4 py-3 font-semibold">Ventas</th>
                <th className="px-4 py-3 font-semibold">Costo pollo</th>
                <th className="px-4 py-3 font-semibold">Utilidad</th>
                <th className="px-4 py-3 font-semibold">% ventas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {items.map((item) => (
                <tr key={item.label} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{item.label}</div>
                    <div className="text-xs text-slate-500">
                      {item.quantitySoldInRange.toLocaleString("es-MX")} piezas
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {item.batchCount.toLocaleString("es-MX")}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-100">
                    {formatMXN(item.totalSales)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-100">
                    {formatMXN(item.totalChickenCost)}
                  </td>
                  <td
                    className={`px-4 py-3 font-mono ${
                      item.totalProfit >= 0 ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {formatMXN(item.totalProfit)}
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

