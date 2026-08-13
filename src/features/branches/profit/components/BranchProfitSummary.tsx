import type { ComponentType } from "react";
import {
  HiChartBar,
  HiClipboardList,
  HiCurrencyDollar,
  HiTrendingUp,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import type { BranchProfitSummary as BranchProfitSummaryType } from "../utils/profit-summary";

interface SummaryProps {
  summary: BranchProfitSummaryType;
  scopeLabel: string;
  selectedBranchLabel: string;
}

const Stat = ({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) => (
  <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        <p className="mt-1 text-sm text-slate-400">{hint}</p>
      </div>
      <div className={`rounded-xl p-3 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default function BranchProfitSummary({
  summary,
  scopeLabel,
  selectedBranchLabel,
}: SummaryProps) {
  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Resumen Ejecutivo
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {scopeLabel}
          </h2>
        </div>
        <p className="text-sm text-slate-400">{selectedBranchLabel}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Stat
          icon={HiCurrencyDollar}
          label="Ventas Totales"
          value={formatMXN(summary.totalSales)}
          hint={`Remesas analizadas: ${summary.batchCount.toLocaleString("es-MX")}`}
          accent="bg-blue-500/10 text-blue-300"
        />
        <Stat
          icon={HiClipboardList}
          label="Gastos Totales"
          value={formatMXN(summary.totalExpenses)}
          hint={`${summary.expenseRatio.toFixed(1)}% de las ventas`}
          accent="bg-rose-500/10 text-rose-300"
        />
        <Stat
          icon={HiChartBar}
          label="Costo Pollo"
          value={formatMXN(summary.totalChickenCosts)}
          hint={`${summary.chickenCostRatio.toFixed(1)}% de las ventas`}
          accent="bg-amber-500/10 text-amber-300"
        />
        <Stat
          icon={HiTrendingUp}
          label="Utilidad Neta"
          value={formatMXN(summary.profit)}
          hint={`Margen neto: ${summary.profitMargin.toFixed(1)}%`}
          accent="bg-emerald-500/10 text-emerald-300"
        />
        <Stat
          icon={HiCurrencyDollar}
          label="Efectivo Esperado"
          value={formatMXN(summary.expectedCash)}
          hint={
            summary.topBusinessUnit
              ? `Mayor unidad: ${summary.topBusinessUnit.label}`
              : "Ventas menos gastos"
          }
          accent="bg-cyan-500/10 text-cyan-300"
        />
        <Stat
          icon={HiOutlineOfficeBuilding}
          label="Sucursal Líder"
          value={summary.topBranch?.label ?? "Sin datos"}
          hint={
            summary.topBranch
              ? `${formatMXN(summary.topBranch.totalSales)} en ventas`
              : "Sin remesas para comparar"
          }
          accent="bg-violet-500/10 text-violet-300"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
        El efectivo esperado se calcula como ventas menos gastos. No descuenta
        el costo de pollo prorrateado.
      </div>
    </section>
  );
}
