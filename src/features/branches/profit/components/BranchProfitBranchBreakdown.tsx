import { formatMXN } from "@/utils/moneyNumbers";
import type { ProfitSummaryItem } from "../utils/profit-summary";

interface Props {
  items: ProfitSummaryItem[];
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const StatLine = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-3 py-2">
    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
      {label}
    </p>
    <p className="mt-1 font-mono text-sm text-white">{value}</p>
  </div>
);

export default function BranchProfitBranchBreakdown({ items }: Props) {
  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Desglose por sucursal
          </h3>
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
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                    Sucursal
                  </p>
                  <h4 className="mt-1 truncate text-lg font-semibold text-white">
                    {item.label}
                  </h4>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.quantitySoldInRange.toLocaleString("es-MX")} piezas ·{" "}
                    {item.batchCount.toLocaleString("es-MX")} remesas
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-right">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-emerald-300 uppercase">
                    Utilidad
                  </p>
                  <p
                    className={`mt-1 text-2xl font-semibold ${
                      item.totalProfit >= 0
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {formatMXN(item.totalProfit)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatLine label="Ventas" value={formatMXN(item.totalSales)} />
                <StatLine
                  label="Costo pollo"
                  value={formatMXN(item.totalChickenCost)}
                />
                <StatLine
                  label="% ventas"
                  value={formatPercent(item.percentage)}
                />
                <StatLine
                  label="Remesas"
                  value={item.batchCount.toLocaleString("es-MX")}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
