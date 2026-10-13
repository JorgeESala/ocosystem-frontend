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
import type { BranchExpenseFilters, BranchExpenseResponseDTO } from "../types";
import { buildBranchExpenseSummary } from "../utils/expense-summary";
import { formatHumanDate, getLastDays } from "@/utils/date.utils";

export default function BranchExpensesPage() {
  const [searchParams] = useSearchParams();
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const defaultRange = useMemo(() => getLastDays(7), []);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>(
    searchParams.get("branch") ? [Number(searchParams.get("branch"))] : [],
  );
  const [startDate, setStartDate] = useState<Date | null>(defaultRange.start);
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.end);

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

  const activeFilters: BranchExpenseFilters | null = rangeError
    ? null
    : {
        branchIds: selectedBranchIds,
        startDate: startDate!,
        endDate: endDate!,
      };

  const searchQuery = useBranchExpensesSearch(activeFilters);
  const expenses = searchQuery.data ?? [];
  const isLoading = searchQuery.isLoading;
  const isError = searchQuery.isError;
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
  const scopeLabel = `Rango ${formatHumanDate(startDate ?? new Date(), "short")} - ${formatHumanDate(endDate ?? new Date(), "short")} | ${selectedBranchLabel}`;

  const handleClearFilters = () => {
    setSelectedBranchIds([]);
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
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
