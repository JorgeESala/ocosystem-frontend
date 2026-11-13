import { useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { HiChevronDown, HiChevronRight, HiSearch } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import TablePagination from "@/components/TablePagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import ComparisonKpi from "@/features/expenses/components/comparison/ComparisonKpi";
import ComparisonMetricCells from "@/features/expenses/components/comparison/ComparisonMetricCells";
import ComparisonTableHead from "@/features/expenses/components/comparison/ComparisonTableHead";
import {
  ComparisonEmpty,
  ComparisonError,
  ComparisonLoading,
} from "@/features/expenses/components/comparison/ComparisonStates";
import {
  buildComparisonHighlights,
  comparisonVariationLabel,
  formatSignedCount,
} from "@/features/expenses/utils/expense-comparison";
import BranchExpenseConceptDrawer from "./BranchExpenseConceptDrawer";
import type {
  BranchExpenseComparisonBranch,
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

const BRANCH_LIMIT = 10;
const CONCEPT_LIMIT = 8;

const CategoryRow = ({ item }: { item: BranchExpenseComparisonItem }) => (
  <tr className="bg-slate-900/30 text-sm">
    <td className="px-3 py-2 pl-9 text-slate-300">{item.label}</td>
    <ComparisonMetricCells {...item} />
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
  const [drawerBranch, setDrawerBranch] =
    useState<BranchExpenseComparisonBranch | null>(null);
  const [branchQuery, setBranchQuery] = useState("");
  const [showAllBranches, setShowAllBranches] = useState(false);

  const allBranches = data?.branches ?? [];
  const branchTerm = branchQuery.trim().toLowerCase();
  const filteredBranches = branchTerm
    ? allBranches.filter((branch) =>
        branch.branchName.toLowerCase().includes(branchTerm),
      )
    : allBranches;
  const branchesExpanded = showAllBranches || branchTerm.length > 0;
  const visibleBranches = branchesExpanded
    ? filteredBranches
    : filteredBranches.slice(0, BRANCH_LIMIT);
  const branchPager = useClientPagination(visibleBranches, {
    pageSize: 25,
    resetKey: `${branchQuery}|${branchesExpanded}|${allBranches.length}`,
  });

  if (isError) return <ComparisonError />;
  if (isLoading) return <ComparisonLoading />;

  const hasData =
    data &&
    (data.current.expenseCount > 0 || data.previous.expenseCount > 0) &&
    data.branches.length > 0;

  if (!hasData) {
    return (
      <ComparisonEmpty
        title="Comparativa por sucursal"
        subtitle={`${currentLabel} vs ${previousLabel} · ${businessUnitLabel}`}
      />
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

      {allBranches.length > BRANCH_LIMIT && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <TextInput
            icon={HiSearch}
            sizing="sm"
            placeholder="Buscar sucursal..."
            value={branchQuery}
            onChange={(event) => setBranchQuery(event.target.value)}
            className="w-full sm:w-64"
          />
          <Button
            size="xs"
            color="gray"
            onClick={() => {
              setShowAllBranches((value) => !value);
              setBranchQuery("");
            }}
          >
            {branchesExpanded
              ? "Ver menos"
              : `Ver todas las sucursales (${allBranches.length})`}
          </Button>
        </div>
      )}

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
        />
        <ComparisonKpi
          title="Sucursales comparadas"
          value={data.branches.length.toLocaleString("es-MX")}
          hint="Abre una sucursal para ver sus conceptos"
        />
        <ComparisonKpi
          title="Mayor aumento"
          value={highlights.topCountIncrease?.label ?? "Sin aumentos"}
          hint={
            highlights.topCountIncrease
              ? `${formatSignedCount(highlights.topCountIncrease.countDifference)} registros`
              : "Ningún concepto creció"
          }
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <ComparisonTableHead firstColumnLabel="Sucursal / concepto" />
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {branchPager.pageItems.map((branch) => {
              const expanded = expandedBranchId === branch.branchId;
              return (
                <BranchRows
                  key={branch.branchId}
                  branch={branch}
                  expanded={expanded}
                  onToggle={() =>
                    setExpandedBranchId(expanded ? null : branch.branchId)
                  }
                  onViewAllConcepts={() => setDrawerBranch(branch)}
                />
              );
            })}
            {branchPager.pageItems.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No hay sucursales que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {branchesExpanded && (
        <TablePagination
          page={branchPager.page}
          pageSize={branchPager.pageSize}
          total={branchPager.total}
          onPageChange={branchPager.setPage}
        />
      )}

      <BranchExpenseConceptDrawer
        open={Boolean(drawerBranch)}
        onClose={() => setDrawerBranch(null)}
        branch={drawerBranch}
        currentLabel={currentLabel}
        previousLabel={previousLabel}
        businessUnitLabel={businessUnitLabel}
      />
    </section>
  );
}

const BranchRows = ({
  branch,
  expanded,
  onToggle,
  onViewAllConcepts,
}: {
  branch: BranchExpenseComparisonBranch;
  expanded: boolean;
  onToggle: () => void;
  onViewAllConcepts: () => void;
}) => {
  const visibleCategories = branch.byCategory.slice(0, CONCEPT_LIMIT);
  return (
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
        <ComparisonMetricCells {...branch} />
      </tr>
      {expanded && visibleCategories.length === 0 && (
        <tr className="bg-slate-900/30">
          <td colSpan={9} className="px-3 py-2 pl-9 text-sm text-slate-400">
            Sin gastos registrados en estos periodos.
          </td>
        </tr>
      )}
      {expanded &&
        visibleCategories.map((item) => (
          <CategoryRow key={`${branch.branchId}-${item.code}`} item={item} />
        ))}
      {expanded && branch.byCategory.length > CONCEPT_LIMIT && (
        <tr className="bg-slate-900/30">
          <td colSpan={9} className="px-3 py-2 pl-9">
            <Button
              size="xs"
              color="gray"
              onClick={onViewAllConcepts}
              aria-label={`Ver todos los conceptos de ${branch.branchName}`}
            >
              Ver todos los conceptos ({branch.byCategory.length})
            </Button>
          </td>
        </tr>
      )}
    </>
  );
};
