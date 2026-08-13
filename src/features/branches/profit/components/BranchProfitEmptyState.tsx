import { HiCurrencyDollar } from "react-icons/hi";

export default function BranchProfitEmptyState() {
  return (
    <section className="rounded-3xl border border-dashed border-slate-700/80 bg-slate-950/50 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
        <HiCurrencyDollar className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">
        El reporte todavía no tiene filtros aplicados
      </h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
        Selecciona una o varias sucursales, define el periodo y genera el
        reporte para ver ventas, gastos, costo de pollo, utilidad neta y
        efectivo esperado.
      </p>
    </section>
  );
}
