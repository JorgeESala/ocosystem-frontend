import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, Spinner } from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import BranchExpenseModal from "../components/BranchExpenseModal";
import BranchExpenseBreakdowns from "../components/BranchExpenseBreakdowns";
import BranchExpenseSummary from "../components/BranchExpenseSummary";
import BranchExpensesFilters from "../components/BranchExpensesFilters";
import BranchExpensesTable from "../components/BranchExpensesTable";
import { useBranchExpensesSearch } from "../api/branch-expenses.queries";
import {
  useBranchBusinessCategories,
  useExpenseCategories,
} from "../api/branch-categories.queries";
import type { BranchExpenseResponseDTO } from "../types";
import {
  buildBranchExpenseSummary,
  type ExpenseSummaryItem,
} from "../utils/expense-summary";
import { formatHumanDate, getLastDays } from "@/utils/date.utils";

interface CatalogEntry {
  id: number;
  name: string;
}

const matchesSelection = (
  rowId: number | null | undefined,
  rowName: string | null | undefined,
  selectedIds: number[],
  catalog: CatalogEntry[],
) => {
  if (selectedIds.length === 0) return true;
  if (rowId != null && selectedIds.includes(rowId)) return true;
  if (!rowName) return false;
  return catalog.some(
    (entry) => selectedIds.includes(entry.id) && entry.name === rowName,
  );
};

const toggleByItem = (
  item: ExpenseSummaryItem,
  catalog: CatalogEntry[],
  current: number[],
  setter: (ids: number[]) => void,
) => {
  const target =
    item.id ?? catalog.find((entry) => entry.name === item.label)?.id;
  if (target == null) return;
  setter(
    current.includes(target)
      ? current.filter((id) => id !== target)
      : [...current, target],
  );
};

export default function BranchExpensesPage() {
  const [searchParams] = useSearchParams();
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const { data: expenseCategories = [] } = useExpenseCategories();
  const { data: businessCategories = [] } = useBranchBusinessCategories();
  const defaultRange = useMemo(() => getLastDays(7), []);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>(
    searchParams.get("branch") ? [Number(searchParams.get("branch"))] : [],
  );
  const [startDate, setStartDate] = useState<Date | null>(defaultRange.start);
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.end);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedBusinessUnitIds, setSelectedBusinessUnitIds] = useState<
    number[]
  >([]);
  const [motivoSearch, setMotivoSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<BranchExpenseResponseDTO | null>(null);

  const startOfDay = (date: Date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy.getTime();
  };

  const rangeError = (() => {
    if (!startDate || !endDate) return "Selecciona el rango de fechas.";
    if (startOfDay(endDate) < startOfDay(startDate))
      return "La fecha final no puede ser menor a la inicial.";
    return null;
  })();

  const activeFilters =
    rangeError || !startDate || !endDate
      ? null
      : { branchIds: selectedBranchIds, startDate, endDate };

  const searchQuery = useBranchExpensesSearch(activeFilters);
  const rawExpenses = searchQuery.data ?? [];
  const isLoading = searchQuery.isLoading;
  const isError = searchQuery.isError;

  const motivoTerm = motivoSearch.trim().toLowerCase();
  const activeFilterCount =
    selectedCategoryIds.length +
    selectedBusinessUnitIds.length +
    (motivoTerm ? 1 : 0);

  const expenses = rawExpenses.filter((expense) => {
    const matchesCategory = matchesSelection(
      expense.expenseCategoryId,
      expense.expenseCategoryName,
      selectedCategoryIds,
      expenseCategories,
    );
    const matchesUnit = matchesSelection(
      expense.businessUnitCategoryId,
      expense.businessUnitCategoryName ?? expense.businessUnitName,
      selectedBusinessUnitIds,
      businessCategories,
    );
    const matchesMotivo =
      !motivoTerm || (expense.reason ?? "").toLowerCase().includes(motivoTerm);
    return matchesCategory && matchesUnit && matchesMotivo;
  });

  const hasExpenses = expenses.length > 0;
  const showSpinner = (loadingBranches || isLoading) && !hasExpenses;
  const showFullError = isError && !hasExpenses;
  const summary = buildBranchExpenseSummary(expenses);

  const selectedBranchNames = selectedBranchIds
    .map((id) => branches.find((branch) => branch.id === id)?.name)
    .filter(Boolean) as string[];
  const selectedBranchLabel =
    selectedBranchNames.length === 0
      ? "Todas las sucursales"
      : selectedBranchNames.length === 1
        ? selectedBranchNames[0]
        : `${selectedBranchNames.slice(0, 2).join(", ")}${
            selectedBranchNames.length > 2
              ? ` +${selectedBranchNames.length - 2}`
              : ""
          }`;
  const scopeLabel = (() => {
    const parts = [
      `Rango ${formatHumanDate(startDate ?? new Date(), "short")} - ${formatHumanDate(endDate ?? new Date(), "short")}`,
      selectedBranchLabel,
    ];
    if (activeFilterCount > 0) {
      parts.push(
        `${activeFilterCount} filtro${activeFilterCount > 1 ? "s" : ""} activo${activeFilterCount > 1 ? "s" : ""}`,
      );
    }
    return parts.join(" | ");
  })();

  const handleClearFilters = () => {
    setSelectedBranchIds([]);
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
    setSelectedCategoryIds([]);
    setSelectedBusinessUnitIds([]);
    setMotivoSearch("");
  };

  const handleCreateClick = () => {
    setSelectedExpense(null);
    setShowModal(true);
  };

  const handleEditClick = (expense: BranchExpenseResponseDTO) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Gastos de sucursales
          </h1>
          <p className="text-sm text-slate-400">
            Control de gastos por sucursal, tipo de gasto y unidad de negocio.
          </p>
        </div>

        <Button onClick={handleCreateClick}>Nuevo gasto</Button>
      </header>

      <BranchExpensesFilters
        branches={branches}
        selectedBranchIds={selectedBranchIds}
        onSelectedBranchIdsChange={setSelectedBranchIds}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        expenseCategories={expenseCategories}
        businessCategories={businessCategories}
        selectedCategoryIds={selectedCategoryIds}
        onSelectedCategoryIdsChange={setSelectedCategoryIds}
        selectedBusinessUnitIds={selectedBusinessUnitIds}
        onSelectedBusinessUnitIdsChange={setSelectedBusinessUnitIds}
        motivoSearch={motivoSearch}
        onMotivoSearchChange={setMotivoSearch}
        onClear={handleClearFilters}
      />

      {rangeError && (
        <Alert
          color="failure"
          className="border border-red-900/40 bg-red-950/40"
        >
          {rangeError}
        </Alert>
      )}

      {!rangeError && (
        <>
          <BranchExpenseSummary
            totalAmount={summary.totalAmount}
            expenseCount={summary.expenseCount}
            averageAmount={summary.averageAmount}
            scopeLabel={scopeLabel}
            topBranch={summary.topBranch?.label}
            topBusinessUnit={summary.topBusinessUnit?.label}
            topExpenseCategory={summary.topExpenseCategory?.label}
          />

          <BranchExpenseBreakdowns
            byBranch={summary.byBranch}
            byBusinessUnit={summary.byBusinessUnit}
            byExpenseCategory={summary.byExpenseCategory}
            activeBranchIds={selectedBranchIds}
            activeBusinessUnitIds={selectedBusinessUnitIds}
            activeCategoryIds={selectedCategoryIds}
            onBranchSelect={(item) =>
              toggleByItem(
                item,
                branches,
                selectedBranchIds,
                setSelectedBranchIds,
              )
            }
            onBusinessUnitSelect={(item) =>
              toggleByItem(
                item,
                businessCategories,
                selectedBusinessUnitIds,
                setSelectedBusinessUnitIds,
              )
            }
            onExpenseCategorySelect={(item) =>
              toggleByItem(
                item,
                expenseCategories,
                selectedCategoryIds,
                setSelectedCategoryIds,
              )
            }
          />

          {isError && hasExpenses && (
            <Alert
              color="warning"
              className="border border-amber-900/40 bg-amber-950/40 text-amber-100"
            >
              No se pudo refrescar el origen. Se muestran los gastos ya
              cargados.
            </Alert>
          )}

          {showSpinner ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : showFullError ? (
            <Alert
              color="failure"
              className="border border-red-900/40 bg-red-950/40"
            >
              No se pudieron cargar los gastos.
            </Alert>
          ) : (
            <BranchExpensesTable
              expenses={expenses}
              onSelect={handleEditClick}
            />
          )}
        </>
      )}

      <BranchExpenseModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExpense(null);
        }}
        expenseToEdit={selectedExpense}
        onCreated={() => undefined}
      />
    </div>
  );
}
