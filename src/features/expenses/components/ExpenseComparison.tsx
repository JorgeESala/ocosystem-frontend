import { Alert, Spinner } from "flowbite-react";
import { HiArrowDown, HiArrowUp, HiChartBar } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import {
  buildComparisonHighlights,
  comparisonVariationLabel,
} from "../utils/expense-comparison";
import type {
  ExpenseComparisonItem,
  ExpenseComparisonResponse,
} from "../types/expense.types";

interface ExpenseComparisonProps {
  data?: ExpenseComparisonResponse;
  isLoading: boolean;
  isError: boolean;
  currentLabel: string;
  previousLabel: string;
}

const signedCount = (value: number) =>
  value > 0
    ? `+${value.toLocaleString("es-MX")}`
    : value.toLocaleString("es-MX");

const signedAmount = (value: number) =>
  value > 0 ? `+${formatMXN(value)}` : formatMXN(value);

const amountVariation = (
  currentAmount: number,
  previousAmount: number,
  variationPct: number | null,
) =>
  comparisonVariationLabel(
    currentAmount > 0 ? 1 : 0,
    previousAmount > 0 ? 1 : 0,
    variationPct,
  );

const ComparisonBars = ({ data }: { data: ExpenseComparisonResponse }) => {
  const items = data.byCategory.slice(0, 6);
  const max = Math.max(
    ...items.flatMap((item) => [item.currentCount, item.previousCount]),
    1,
  );

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <HiChartBar className="h-4 w-4 text-blue-300" />
        <h3 className="text-sm font-semibold text-white">
          Registros por concepto
        </h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.code}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-slate-200">{item.label}</span>
              <span className="shrink-0 font-mono text-slate-400">
                {item.previousCount.toLocaleString("es-MX")} →{" "}
                {item.currentCount.toLocaleString("es-MX")}
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(item.currentCount / max) * 100}%` }}
                />
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-slate-500"
                  style={{ width: `${(item.previousCount / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Actual
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-500" /> Anterior
        </span>
      </div>
    </div>
  );
};

const Kpi = ({
  title,
  value,
  hint,
  variation,
  up,
}: {
  title: string;
  value: string;
  hint: string;
  variation?: string;
  up?: boolean;
}) => (
  <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
    <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
      {title}
    </p>
    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    <p className="mt-1 text-sm text-slate-400">{hint}</p>
    {variation && (
      <p
        className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
          up ? "text-red-300" : "text-emerald-300"
        }`}
      >
        {up ? (
          <HiArrowUp className="h-3 w-3" />
        ) : (
          <HiArrowDown className="h-3 w-3" />
        )}
        {variation}
      </p>
    )}
  </div>
);

export default function ExpenseComparison({
  data,
  isLoading,
  isError,
  currentLabel,
  previousLabel,
}: ExpenseComparisonProps) {
  if (isError) {
    return (
      <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
        No se pudo cargar la comparativa.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <div className="flex items-center justify-center py-6">
          <Spinner size="lg" />
        </div>
      </section>
    );
  }

  const hasData =
    data &&
    (data.current.expenseCount > 0 || data.previous.expenseCount > 0) &&
    data.byCategory.length > 0;

  if (!hasData) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <h2 className="text-lg font-semibold text-white">
          Comparativa de gastos
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {currentLabel} vs {previousLabel}
        </p>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
          No hay gastos para comparar en estos periodos.
        </div>
      </section>
    );
  }

  const highlights = buildComparisonHighlights(data.byCategory);

  return (
    <section className="space-y-4 rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Comparativa de gastos
          </p>
          <h2 className="text-lg font-semibold text-white">
            {currentLabel} vs {previousLabel}
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Se comparan registros y montos de los mismos conceptos.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          title="Registros"
          value={data.current.expenseCount.toLocaleString("es-MX")}
          hint={`${data.previous.expenseCount.toLocaleString("es-MX")} en el periodo anterior`}
          variation={comparisonVariationLabel(
            data.current.expenseCount,
            data.previous.expenseCount,
            data.countVariationPct,
          )}
          up={data.countDifference > 0}
        />
        <Kpi
          title="Monto"
          value={formatMXN(data.current.totalAmount)}
          hint={`${formatMXN(data.previous.totalAmount)} en el periodo anterior`}
          variation={amountVariation(
            data.current.totalAmount,
            data.previous.totalAmount,
            data.amountVariationPct,
          )}
          up={data.amountDifference > 0}
        />
        <Kpi
          title="Mayor aumento"
          value={highlights.topCountIncrease?.label ?? "Sin aumentos"}
          hint={
            highlights.topCountIncrease
              ? `${signedCount(highlights.topCountIncrease.countDifference)} registros`
              : "Ningún concepto creció"
          }
        />
        <Kpi
          title="Mayor disminución"
          value={highlights.topCountDecrease?.label ?? "Sin disminuciones"}
          hint={
            highlights.topCountDecrease
              ? `${signedCount(highlights.topCountDecrease.countDifference)} registros`
              : "Ningún concepto bajó"
          }
        />
      </div>

      <ComparisonBars data={data} />

      <ComparisonTable items={data.byCategory} />

      {data.byExpenseType.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">
            Por tipo de gasto
          </h3>
          <ComparisonTable items={data.byExpenseType} />
        </div>
      )}
    </section>
  );
}

const ComparisonTable = ({ items }: { items: ExpenseComparisonItem[] }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-800">
    <table className="w-full min-w-[860px] border-collapse text-left">
      <thead className="bg-slate-900/80 text-xs tracking-[0.12em] text-slate-400 uppercase">
        <tr>
          <th className="px-3 py-2.5 font-semibold">Concepto</th>
          <th className="px-3 py-2.5 text-right font-semibold">
            Registros actual
          </th>
          <th className="px-3 py-2.5 text-right font-semibold">
            Registros anterior
          </th>
          <th className="px-3 py-2.5 text-right font-semibold">
            Dif. registros
          </th>
          <th className="px-3 py-2.5 text-right font-semibold">% registros</th>
          <th className="px-3 py-2.5 text-right font-semibold">Monto actual</th>
          <th className="px-3 py-2.5 text-right font-semibold">
            Monto anterior
          </th>
          <th className="px-3 py-2.5 text-right font-semibold">Dif. monto</th>
          <th className="px-3 py-2.5 text-right font-semibold">% monto</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800 bg-slate-950/40">
        {items.map((item) => (
          <tr key={item.code} className="hover:bg-slate-900/40">
            <td className="px-3 py-2.5 font-medium text-slate-100">
              {item.label}
            </td>
            <td className="px-3 py-2.5 text-right text-slate-200">
              {item.currentCount.toLocaleString("es-MX")}
            </td>
            <td className="px-3 py-2.5 text-right text-slate-400">
              {item.previousCount.toLocaleString("es-MX")}
            </td>
            <td className="px-3 py-2.5 text-right text-slate-200">
              {signedCount(item.countDifference)}
            </td>
            <td className="px-3 py-2.5 text-right text-slate-200">
              {comparisonVariationLabel(
                item.currentCount,
                item.previousCount,
                item.countVariationPct,
              )}
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-200">
              {formatMXN(item.currentAmount)}
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-400">
              {formatMXN(item.previousAmount)}
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-slate-200">
              {signedAmount(item.amountDifference)}
            </td>
            <td className="px-3 py-2.5 text-right text-slate-200">
              {amountVariation(
                item.currentAmount,
                item.previousAmount,
                item.amountVariationPct,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
