import { formatMXN } from "@/utils/moneyNumbers";
import type { CashBreakdown } from "../utils/profit-summary";

interface Props {
  breakdown: CashBreakdown;
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

export default function BranchProfitCashBreakdown({ breakdown }: Props) {
  const { items, totals } = breakdown;
  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Efectivo por unidad de negocio
          </h3>
          <p className="text-sm text-slate-400">
            Cada tarjeta prioriza el efectivo esperado antes que ventas o
            gastos.
          </p>
        </div>
        <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          Ordenado por efectivo esperado
        </span>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">
            Efectivo total esperado
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-cyan-300">
            {formatMXN(totals.totalExpectedCash)}
          </p>
        </div>
        <StatLine label="Ventas totales" value={formatMXN(totals.totalSales)} />
        <StatLine
          label="Gastos totales"
          value={formatMXN(totals.totalExpenses)}
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
          No hay datos por unidad de negocio para el filtro actual.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
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
                    {item.branchName}
                  </h4>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.businessUnitName}
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-500/10 px-3 py-2 text-right">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">
                    Efectivo
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-300">
                    {formatMXN(item.expectedCash)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatLine label="Ventas" value={formatMXN(item.totalSales)} />
                <StatLine
                  label="Gastos"
                  value={formatMXN(item.totalExpenses)}
                />
                <StatLine
                  label="% caja"
                  value={formatPercent(item.percentage)}
                />
              </div>

              <div className="mt-4 h-1.5 rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-cyan-400"
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-400">
        En esta vista se ocultan las unidades{" "}
        <span className="text-slate-200">Merma</span> y{" "}
        <span className="text-slate-200">Matados</span>.
      </div>
    </section>
  );
}
