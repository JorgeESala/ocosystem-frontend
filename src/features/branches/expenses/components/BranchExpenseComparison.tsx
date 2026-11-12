import { useState } from "react";
import { Alert, Spinner } from "flowbite-react";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import {
  buildComparisonHighlights,
  comparisonVariationLabel,
} from "@/features/expenses/utils/expense-comparison";
import type {
  BranchExpenseComparisonItem,
  BranchExpenseComparisonResponse,
} from "../types";

interface BranchExpenseComparisonProps {
  data?: BranchExpenseComparisonResponse;
  isLoading: boolean;
  isError: boolean;
  currentLabel: string;
  previousLabel: string;
  businessUnitLabel: string;
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

const MetricCells = ({
  currentCount,
  previousCount,
  countDifference,
  countVariationPct,
  currentAmount,
  previousAmount,
  amountDifference,
  amountVariationPct,
  newInCurrent,
}: {
  currentCount: number;
  previousCount: number;
  countDifference: number;
  countVariationPct: number | null;
  currentAmount: number;
  previousAmount: number;
  amountDifference: number;
  amountVariationPct: number | null;
  newInCurrent: boolean;
}) => (
  <>
    <td className="px-3 py-2.5 text-right text-slate-200">
      {currentCount.toLocaleString("es-MX")}
    </td>
    <td className="px-3 py-2.5 text-right text-slate-400">
      {previousCount.toLocaleString("es-MX")}
    </td>
    <td className="px-3 py-2.5 text-right text-slate-200">
      {signedCount(countDifference)}
    </td>
    <td className="px-3 py-2.5 text-right text-slate-200">
      {newInCurrent
        ? "Nuevo"
        : comparisonVariationLabel(
            currentCount,
            previousCount,
            countVariationPct,
          )}
    </td>
    <td className="px-3 py-2.5 text-right font-mono text-slate-200">
      {formatMXN(currentAmount)}
    </td>
    <td className="px-3 py-2.5 text-right font-mono text-slate-400">
      {formatMXN(previousAmount)}
    </td>
    <td className="px-3 py-2.5 text-right font-mono text-slate-200">
      {signedAmount(amountDifference)}
    </td>
    <td className="px-3 py-2.5 text-right text-slate-200">
      {amountVariation(currentAmount, previousAmount, amountVariationPct)}
    </td>
  </>
);

const CategoryRow = ({ item }: { item: BranchExpenseComparisonItem }) => (
  <tr className="bg-slate-900/30 text-sm">
    <td className="px-3 py-2 pl-9 text-slate-300">{item.label}</td>
    <MetricCells
      currentCount={item.currentCount}
      previousCount={item.previousCount}
      countDifference={item.countDifference}
      countVariationPct={item.countVariationPct}
      currentAmount={item.currentAmount}
      previousAmount={item.previousAmount}
      amountDifference={item.amountDifference}
      amountVariationPct={item.amountVariationPct}
      newInCurrent={item.newInCurrent}
    />
  </tr>
);

export default function BranchExpenseComparison({
  data,
  isLoading,
  isError,
  currentLabel,
  previousLabel,
  businessUnitLabel,
}: BranchExpenseComparisonProps) {
  const [expandedBranchId, setExpandedBranchId] = useState<number | null>(null);

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
    data.branches.length > 0;

  if (!hasData) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <h2 className="text-lg font-semibold text-white">
          Comparativa por sucursal
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {currentLabel} vs {previousLabel} · {businessUnitLabel}
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
            Comparativa por sucursal
          </p>
          <h2 className="text-lg font-semibold text-white">
            {currentLabel} vs {previousLabel}
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Unidad de negocio:{" "}
          <span className="text-slate-200">{businessUnitLabel}</span>
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Registros
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {data.current.expenseCount.toLocaleString("es-MX")}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {data.previous.expenseCount.toLocaleString("es-MX")} en el periodo
            anterior
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-300">
            {comparisonVariationLabel(
              data.current.expenseCount,
              data.previous.expenseCount,
              data.countVariationPct,
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Monto
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {formatMXN(data.current.totalAmount)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {formatMXN(data.previous.totalAmount)} en el periodo anterior
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-300">
            {amountVariation(
              data.current.totalAmount,
              data.previous.totalAmount,
              data.amountVariationPct,
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Sucursales comparadas
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {data.branches.length.toLocaleString("es-MX")}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Abre una sucursal para ver sus conceptos
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Mayor aumento
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {highlights.topCountIncrease?.label ?? "Sin aumentos"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {highlights.topCountIncrease
              ? `${signedCount(highlights.topCountIncrease.countDifference)} registros`
              : "Ningún concepto creció"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead className="bg-slate-900/80 text-xs tracking-[0.12em] text-slate-400 uppercase">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Sucursal / concepto</th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Registros actual
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Registros anterior
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Dif. registros
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                % registros
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Monto actual
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Monto anterior
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Dif. monto
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">% monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {data.branches.map((branch) => {
              const expanded = expandedBranchId === branch.branchId;
              return (
                <BranchRows
                  key={branch.branchId}
                  branch={branch}
                  expanded={expanded}
                  onToggle={() =>
                    setExpandedBranchId(expanded ? null : branch.branchId)
                  }
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const BranchRows = ({
  branch,
  expanded,
  onToggle,
}: {
  branch: BranchExpenseComparisonResponse["branches"][number];
  expanded: boolean;
  onToggle: () => void;
}) => (
  <>
    <tr className="hover:bg-slate-900/40">
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Ocultar" : "Ver"} conceptos de ${branch.branchName}`}
          className="flex w-full items-center gap-2 text-left font-medium text-slate-100"
        >
          {expanded ? (
            <HiChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <HiChevronRight className="h-4 w-4 text-slate-400" />
          )}
          {branch.branchName}
        </button>
      </td>
      <MetricCells
        currentCount={branch.currentCount}
        previousCount={branch.previousCount}
        countDifference={branch.countDifference}
        countVariationPct={branch.countVariationPct}
        currentAmount={branch.currentAmount}
        previousAmount={branch.previousAmount}
        amountDifference={branch.amountDifference}
        amountVariationPct={branch.amountVariationPct}
        newInCurrent={branch.newInCurrent}
      />
    </tr>
    {expanded && branch.byCategory.length === 0 && (
      <tr className="bg-slate-900/30">
        <td colSpan={9} className="px-3 py-2 pl-9 text-sm text-slate-400">
          Sin gastos registrados en estos periodos.
        </td>
      </tr>
    )}
    {expanded &&
      branch.byCategory.map((item) => (
        <CategoryRow key={`${branch.branchId}-${item.code}`} item={item} />
      ))}
  </>
);
