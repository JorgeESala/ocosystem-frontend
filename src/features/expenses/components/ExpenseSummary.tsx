import type { ComponentType } from "react";
import {
  HiChartBar,
  HiClipboardList,
  HiCurrencyDollar,
} from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";

interface ExpenseSummaryProps {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  scopeLabel: string;
  topCategory?: string;
}

const Stat = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
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
      <div className="rounded-xl bg-blue-500/10 p-3 text-blue-300">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default function ExpenseSummary({
  totalAmount,
  expenseCount,
  averageAmount,
  scopeLabel,
  topCategory,
}: ExpenseSummaryProps) {
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
        <p className="text-sm text-slate-400">
          Totales calculados con los gastos cargados en pantalla.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Stat
          icon={HiCurrencyDollar}
          label="Total Gastado"
          value={formatMXN(totalAmount)}
          hint="Suma de los montos visibles"
        />
        <Stat
          icon={HiClipboardList}
          label="Movimientos"
          value={expenseCount.toLocaleString("es-MX")}
          hint="Cantidad de gastos mostrados"
        />
        <Stat
          icon={HiChartBar}
          label="Promedio"
          value={formatMXN(averageAmount)}
          hint={
            topCategory
              ? `Mayor categoria: ${topCategory}`
              : "Monto promedio por gasto"
          }
        />
      </div>
    </section>
  );
}