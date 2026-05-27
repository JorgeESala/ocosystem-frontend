import { useMemo, useState, type ComponentType } from "react";
import { Alert } from "flowbite-react";
import {
  HiClipboardList,
  HiCurrencyDollar,
  HiOutlineOfficeBuilding,
  HiOutlineSwitchHorizontal,
  HiChartBar,
} from "react-icons/hi";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import type { BranchExpenseResponseDTO } from "@/features/branches/expenses/types";
import {
  buildBranchProfitExpenseSummary,
  type ProfitExpenseSummaryItem,
} from "../utils/profit-expense-summary";
import BranchProfitDataTable from "./BranchProfitDataTable";

type ViewMode = "category" | "branch" | "movement";

interface Props {
  expenses: BranchExpenseResponseDTO[];
  totalSales: number;
  isLoading: boolean;
  isError: boolean;
  scopeLabel: string;
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

const SummaryTable = ({
  title,
  subtitle,
  items,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  items: ProfitExpenseSummaryItem[];
  emptyLabel: string;
}) => (
  <section className="rounded-3xl border border-slate-700/80 bg-slate-950/60 p-5">
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
      <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
        Ordenado por monto
      </span>
    </div>

    {items.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
        {emptyLabel}
      </div>
    ) : (
      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Concepto</th>
              <th className="px-4 py-3 font-semibold">Monto</th>
              <th className="px-4 py-3 font-semibold">Movs</th>
              <th className="px-4 py-3 font-semibold">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {items.map((item) => (
              <tr key={item.label} className="hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-100">{item.label}</div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-100">
                  {formatMXN(item.totalAmount)}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {item.expenseCount.toLocaleString("es-MX")}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {item.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default function BranchProfitExpenseAudit({
  expenses,
  totalSales,
  isLoading,
  isError,
  scopeLabel,
}: Props) {
  const [mode, setMode] = useState<ViewMode>("category");
  const summary = useMemo(
    () => buildBranchProfitExpenseSummary(expenses, totalSales),
    [expenses, totalSales],
  );

  const rows = useMemo(
    () =>
      expenses.map((expense) => ({
        date: expense.date,
        branchName: expense.branchName,
        businessUnitName:
          expense.businessUnitCategoryName ?? expense.businessUnitName ?? "Sin unidad",
        expenseCategoryName: expense.expenseCategoryName,
        reason: expense.reason,
        amount: Number(expense.amount || 0),
      })),
    [expenses],
  );

  const columns = [
    {
      key: "date",
      label: "Fecha",
      sortable: true,
      render: (value: string) => formatHumanDate(value, "short"),
    },
    { key: "branchName", label: "Sucursal", sortable: true },
    { key: "businessUnitName", label: "Unidad", sortable: true },
    { key: "expenseCategoryName", label: "Categoría", sortable: true },
    { key: "reason", label: "Motivo", sortable: true },
    {
      key: "amount",
      label: "Monto",
      sortable: true,
      render: (value: number) => formatMXN(value),
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Auditoría de gastos
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">{scopeLabel}</h2>
        </div>
        <p className="text-sm text-slate-400">
          Los gastos se cargan con los mismos filtros del reporte para explicar
          el efectivo esperado.
        </p>
      </div>

      {isError && (
        <Alert
          color="warning"
          className="mb-4 border border-amber-900/40 bg-amber-950/40 text-amber-100"
        >
          No se pudieron cargar los gastos del periodo. El resto del reporte
          sigue disponible.
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={HiCurrencyDollar}
          label="Total Gastos"
          value={formatMXN(summary.totalAmount)}
          hint={`${summary.expenseToSalesRatio.toFixed(1)}% de las ventas`}
          accent="bg-rose-500/10 text-rose-300"
        />
        <Stat
          icon={HiClipboardList}
          label="Movimientos"
          value={summary.expenseCount.toLocaleString("es-MX")}
          hint="Cantidad de gastos encontrados"
          accent="bg-blue-500/10 text-blue-300"
        />
        <Stat
          icon={HiChartBar}
          label="Promedio"
          value={formatMXN(summary.averageAmount)}
          hint="Monto promedio por gasto"
          accent="bg-amber-500/10 text-amber-300"
        />
        <Stat
          icon={HiOutlineOfficeBuilding}
          label="Lidera"
          value={summary.topCategory?.label ?? "Sin datos"}
          hint={
            summary.topBranch
              ? `Mayor sucursal: ${summary.topBranch.label}`
              : "Aún no hay movimientos"
          }
          accent="bg-violet-500/10 text-violet-300"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200">
            <HiOutlineSwitchHorizontal className="h-4 w-4" />
            Vista explicativa
          </span>
          <span>Las tablas muestran qué gastos empujan el efectivo esperado.</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={() => setMode("category")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "category"
              ? "bg-cyan-500 text-slate-950"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          Por categoría
        </button>
        <button
          type="button"
          onClick={() => setMode("branch")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "branch"
              ? "bg-cyan-500 text-slate-950"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          Por sucursal
        </button>
        <button
          type="button"
          onClick={() => setMode("movement")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "movement"
              ? "bg-cyan-500 text-slate-950"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          Movimientos
        </button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
            Cargando gastos del periodo...
          </div>
        ) : mode === "category" ? (
          <SummaryTable
            title="Resumen por categoría"
            subtitle="Qué tipos de gasto consumen más efectivo."
            items={summary.byCategory}
            emptyLabel="No hay gastos por categoría para el filtro actual."
          />
        ) : mode === "branch" ? (
          <SummaryTable
            title="Resumen por sucursal"
            subtitle="Qué sucursales concentran más gasto."
            items={summary.byBranch}
            emptyLabel="No hay gastos por sucursal para el filtro actual."
          />
        ) : (
          <section className="rounded-3xl border border-slate-700/80 bg-slate-950/60 p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Detalle de movimientos
                </h3>
                <p className="text-sm text-slate-400">
                  Fecha, sucursal, unidad, categoría y motivo del gasto.
                </p>
              </div>
              <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                {expenses.length.toLocaleString("es-MX")} registros
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
                No hay movimientos para mostrar con el filtro actual.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <BranchProfitDataTable columns={columns} data={rows} />
              </div>
            )}
          </section>
        )}
      </div>
    </section>
  );
}
