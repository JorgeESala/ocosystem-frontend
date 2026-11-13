import { HiChartBar } from "react-icons/hi";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import ComparisonConceptTable from "./comparison/ComparisonConceptTable";
import ComparisonKpi from "./comparison/ComparisonKpi";
import ComparisonPeriodHelp from "./comparison/ComparisonPeriodHelp";
import {
  ComparisonEmpty,
  ComparisonError,
  ComparisonLoading,
} from "./comparison/ComparisonStates";
import {
  buildComparisonHighlights,
  comparisonVariationLabel,
  formatSignedCount,
} from "../utils/expense-comparison";
import type { ExpenseComparisonResponse } from "../types/expense.types";

interface ExpenseComparisonProps {
  data?: ExpenseComparisonResponse;
  isLoading: boolean;
  isError: boolean;
  currentLabel: string;
  previousLabel: string;
}

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

export default function ExpenseComparison({
  data,
  isLoading,
  isError,
  currentLabel,
  previousLabel,
}: ExpenseComparisonProps) {
  if (isError) return <ComparisonError />;
  if (isLoading) return <ComparisonLoading />;

  const hasData =
    data &&
    (data.current.expenseCount > 0 || data.previous.expenseCount > 0) &&
    data.byCategory.length > 0;

  if (!hasData) {
    return (
      <ComparisonEmpty
        title="Comparativa de gastos"
        subtitle={`${currentLabel} vs ${previousLabel}`}
      />
    );
  }

  const highlights = buildComparisonHighlights(data.byCategory);

  return (
    <section className="space-y-4 rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Comparativa de gastos
            </p>
            <ComparisonPeriodHelp />
          </div>
          <h2 className="text-lg font-semibold text-white">
            {currentLabel} vs {previousLabel}
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Se comparan registros y montos de los mismos conceptos.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ComparisonKpi
          title="Registros"
          value={data.current.expenseCount.toLocaleString("es-MX")}
          hint={`${data.previous.expenseCount.toLocaleString("es-MX")} en el periodo anterior`}
          variation={comparisonVariationLabel(
            data.current.expenseCount,
            data.previous.expenseCount,
            data.countVariationPct,
          )}
          up={data.countDifference > 0}
          info={
            <InfoTip title="Registros del periodo">
              Gastos del periodo actual comparados contra el periodo anterior de
              la misma duración.
            </InfoTip>
          }
        />
        <ComparisonKpi
          title="Monto"
          value={formatMXN(data.current.totalAmount)}
          hint={`${formatMXN(data.previous.totalAmount)} en el periodo anterior`}
          variation={comparisonVariationLabel(
            data.current.totalAmount > 0 ? 1 : 0,
            data.previous.totalAmount > 0 ? 1 : 0,
            data.amountVariationPct,
          )}
          up={data.amountDifference > 0}
          info={
            <InfoTip title="Monto del periodo">
              Suma de los montos del periodo actual y del periodo anterior.
            </InfoTip>
          }
        />
        <ComparisonKpi
          title="Mayor aumento"
          value={highlights.topCountIncrease?.label ?? "Sin aumentos"}
          hint={
            highlights.topCountIncrease
              ? `${formatSignedCount(highlights.topCountIncrease.countDifference)} registros`
              : "Ningún concepto creció"
          }
          info={
            <InfoTip title="Mayor aumento de registros">
              Concepto con el mayor crecimiento en número de registros. Si no
              hubo aumentos, se muestra “Sin aumentos”.
            </InfoTip>
          }
        />
        <ComparisonKpi
          title="Mayor disminución"
          value={highlights.topCountDecrease?.label ?? "Sin disminuciones"}
          hint={
            highlights.topCountDecrease
              ? `${formatSignedCount(highlights.topCountDecrease.countDifference)} registros`
              : "Ningún concepto bajó"
          }
          info={
            <InfoTip title="Mayor disminución de registros">
              Concepto con la mayor caída en número de registros. Si no hubo
              disminuciones, se muestra “Sin disminuciones”.
            </InfoTip>
          }
        />
      </div>

      <ComparisonBars data={data} />

      <ComparisonConceptTable title="Por concepto" items={data.byCategory} />

      {data.byExpenseType.length > 0 && (
        <ComparisonConceptTable
          title="Por tipo de gasto"
          items={data.byExpenseType}
        />
      )}
    </section>
  );
}
