import { Badge, Button, Spinner, ToggleSwitch } from "flowbite-react";
import { HiDownload } from "react-icons/hi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMXN, formatMXNCompact } from "@/utils/moneyNumbers";
import type {
  BranchExpenseAnalyticsCategory,
  BranchExpenseAnalyticsResponse,
  BranchExpenseGranularity,
  BranchExpenseReportGroup,
} from "../types";
import { downloadBranchExpenseReportCsv } from "../utils/report-csv";

interface Props {
  data?: BranchExpenseAnalyticsResponse;
  isLoading: boolean;
  isError: boolean;
  granularity: BranchExpenseGranularity;
  onGranularityChange: (value: BranchExpenseGranularity) => void;
  includeNonOperating: boolean;
  onIncludeNonOperatingChange: (value: boolean) => void;
  scopeLabel: string;
}

const GRANULARITIES: Array<{ value: BranchExpenseGranularity; label: string }> = [
  { value: "WEEK", label: "Semana" },
  { value: "MONTH", label: "Mes" },
  { value: "YEAR", label: "Año" },
];

const REPORT_GROUP_LABELS: Record<BranchExpenseReportGroup, string> = {
  COSTO: "Costo",
  VENTA: "Venta",
  ADMIN: "Administración",
  INVERSION: "Inversión",
  NO_GASTO: "No gasto",
};

const REPORT_GROUP_COLORS: Record<
  BranchExpenseReportGroup,
  "info" | "success" | "gray" | "purple" | "warning"
> = {
  COSTO: "info",
  VENTA: "success",
  ADMIN: "gray",
  INVERSION: "purple",
  NO_GASTO: "warning",
};

const variationLabel = (value: number | null) => {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

const variationClass = (value: number | null) => {
  if (value == null) return "text-slate-400";
  if (value > 0) return "text-rose-300";
  if (value < 0) return "text-emerald-300";
  return "text-slate-300";
};

const flattenCategories = (
  categories: BranchExpenseAnalyticsCategory[],
): Array<{ category: BranchExpenseAnalyticsCategory; depth: number }> => {
  const rows: Array<{ category: BranchExpenseAnalyticsCategory; depth: number }> =
    [];
  for (const category of categories) {
    rows.push({ category, depth: 0 });
    for (const child of category.children) {
      rows.push({ category: child, depth: 1 });
    }
  }
  return rows;
};

const Stat = ({ label, value, hint }: { label: string; value: string; hint: string }) => (
  <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-3 shadow-sm">
    <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
      {label}
    </p>
    <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
  </div>
);

export default function BranchExpenseReport({
  data,
  isLoading,
  isError,
  granularity,
  onGranularityChange,
  includeNonOperating,
  onIncludeNonOperatingChange,
  scopeLabel,
}: Props) {
  if (isLoading && !data) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-red-900/40 bg-red-950/30 px-4 py-8 text-center text-sm text-red-100">
        No se pudo cargar el reporte de gastos.
      </div>
    );
  }

  const chartData = data.buckets.map((bucket) => ({
    label: bucket.label,
    amount: bucket.amount,
    count: bucket.count,
  }));

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Reporte de gastos
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-white">{scopeLabel}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              {GRANULARITIES.map((item) => (
                <Button
                  key={item.value}
                  size="xs"
                  color={granularity === item.value ? "blue" : "gray"}
                  onClick={() => onGranularityChange(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <Button
              size="xs"
              color="gray"
              onClick={() => downloadBranchExpenseReportCsv(data, scopeLabel)}
            >
              <HiDownload className="mr-1 h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <ToggleSwitch
            checked={includeNonOperating}
            label="Incluir inversión y préstamos"
            onChange={onIncludeNonOperatingChange}
          />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Gasto actual"
          value={formatMXN(data.current.totalAmount)}
          hint={`${data.current.expenseCount.toLocaleString("es-MX")} movimientos`}
        />
        <Stat
          label="Periodo anterior"
          value={formatMXN(data.previous.totalAmount)}
          hint={`${data.previous.expenseCount.toLocaleString("es-MX")} movimientos`}
        />
        <Stat
          label="Variación"
          value={variationLabel(data.amountVariationPct)}
          hint="Contra el periodo anterior"
        />
        <Stat
          label="Promedio"
          value={formatMXN(data.current.averageAmount)}
          hint="Monto promedio por movimiento"
        />
      </div>

      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Tendencia</h3>
            <p className="text-xs text-slate-400">
              Gasto por {granularity === "WEEK" ? "semana" : granularity === "YEAR" ? "año" : "mes"}.
            </p>
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
            No hay gastos en el periodo.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(value) => formatMXNCompact(Number(value))}
                />
                <RechartsTooltip
                  formatter={(value) => [formatMXN(Number(value)), "Gasto"]}
                  labelStyle={{ color: "#e2e8f0" }}
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">
          Gasto por categoría y subcategoría
        </h3>
        {data.categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
            No hay gastos en el periodo.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Categoría</th>
                  <th className="px-4 py-2.5 font-semibold">Actual</th>
                  <th className="px-4 py-2.5 font-semibold">Anterior</th>
                  <th className="px-4 py-2.5 font-semibold">Variación</th>
                  <th className="px-4 py-2.5 font-semibold">Movs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {flattenCategories(data.categories).map(({ category, depth }) => (
                  <tr key={`${category.id ?? "none"}-${depth}`}>
                    <td className="px-4 py-2.5">
                      <div
                        className={
                          depth === 0
                            ? "font-semibold text-slate-100"
                            : "pl-4 text-slate-300"
                        }
                      >
                        {category.name}
                      </div>
                      {category.reportGroup && (
                        <Badge
                          className="mt-1 w-fit"
                          color={
                            REPORT_GROUP_COLORS[
                              category.reportGroup as BranchExpenseReportGroup
                            ] ?? "gray"
                          }
                        >
                          {REPORT_GROUP_LABELS[
                            category.reportGroup as BranchExpenseReportGroup
                          ] ?? category.reportGroup}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm text-slate-100">
                      {formatMXN(category.currentAmount)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm text-slate-400">
                      {formatMXN(category.previousAmount)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-sm ${variationClass(category.amountVariationPct)}`}
                    >
                      {variationLabel(category.amountVariationPct)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-300">
                      {category.currentCount.toLocaleString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Gasto por sucursal</h3>
        {data.branches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
            No hay gastos en el periodo.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Sucursal</th>
                  <th className="px-4 py-2.5 font-semibold">Actual</th>
                  <th className="px-4 py-2.5 font-semibold">Anterior</th>
                  <th className="px-4 py-2.5 font-semibold">Variación</th>
                  <th className="px-4 py-2.5 font-semibold">Movs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {data.branches.map((branch) => (
                  <tr key={branch.id ?? branch.name}>
                    <td className="px-4 py-2.5 font-medium text-slate-100">
                      {branch.name}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm text-slate-100">
                      {formatMXN(branch.currentAmount)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm text-slate-400">
                      {formatMXN(branch.previousAmount)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-sm ${variationClass(branch.amountVariationPct)}`}
                    >
                      {variationLabel(branch.amountVariationPct)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-300">
                      {branch.currentCount.toLocaleString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
