import type { ComponentType, ReactNode } from "react";
import {
  HiChartBar,
  HiClipboardList,
  HiCurrencyDollar,
  HiOfficeBuilding,
} from "react-icons/hi";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";

interface SummaryProps {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  scopeLabel: string;
  topBranch?: string;
  topBusinessUnit?: string;
  topExpenseCategory?: string;
}

const Stat = ({
  icon: Icon,
  label,
  value,
  hint,
  info,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  info?: ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-3 shadow-sm">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            {label}
          </p>
          {info}
        </div>
        <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      </div>
      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-300">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </div>
);

export default function BranchExpenseSummary({
  totalAmount,
  expenseCount,
  averageAmount,
  scopeLabel,
  topBranch,
  topBusinessUnit,
  topExpenseCategory,
}: SummaryProps) {
  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-4">
      <div className="mb-3">
        <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
          Resumen Ejecutivo
        </p>
        <h2 className="mt-0.5 text-base font-semibold text-white">
          {scopeLabel}
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={HiCurrencyDollar}
          label="Total Gastado"
          value={formatMXN(totalAmount)}
          hint="Suma de los gastos filtrados"
          info={
            <InfoTip title="Total gastado">
              Suma de todos los gastos que cumplen los filtros de la página. No
              cambia al paginar ni al buscar dentro de la tabla.
            </InfoTip>
          }
        />
        <Stat
          icon={HiClipboardList}
          label="Movimientos"
          value={expenseCount.toLocaleString("es-MX")}
          hint="Cantidad de gastos filtrados"
          info={
            <InfoTip title="Movimientos">
              Cantidad de gastos que cumplen los filtros de la página.
            </InfoTip>
          }
        />
        <Stat
          icon={HiChartBar}
          label="Promedio"
          value={formatMXN(averageAmount)}
          hint="Monto promedio por gasto"
          info={
            <InfoTip title="Promedio">
              Total gastado dividido entre el número de movimientos.
            </InfoTip>
          }
        />
        <Stat
          icon={HiOfficeBuilding}
          label="Lidera"
          value={topBranch ?? "Sin datos"}
          hint={
            topExpenseCategory
              ? `Mayor tipo: ${topExpenseCategory}`
              : topBusinessUnit
                ? `Mayor unidad: ${topBusinessUnit}`
                : "Ninguna categoria con datos"
          }
          info={
            <InfoTip title="Sucursal líder">
              Sucursal con el mayor monto gastado en el periodo filtrado. Abajo
              se muestra su tipo de gasto principal.
            </InfoTip>
          }
        />
      </div>
    </section>
  );
}
