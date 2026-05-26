import { useState } from "react";
import { Alert, Button, Spinner } from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import BranchExpenseModal from "../components/BranchExpenseModal";
import BranchExpensesFilters from "../components/BranchExpensesFilters";
import BranchExpensesList from "../components/BranchExpensesList";
import {
  useBranchExpensesSearch,
  useLatestBranchExpenses,
} from "../api/branch-expenses.queries";
import type { BranchExpenseFilters, BranchExpenseResponseDTO } from "../types";

export default function BranchExpensesPage() {
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [activeFilters, setActiveFilters] =
    useState<BranchExpenseFilters | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<BranchExpenseResponseDTO | null>(null);

  const latestExpensesQuery = useLatestBranchExpenses();
  const filteredExpensesQuery = useBranchExpensesSearch(activeFilters);

  const usingFilters = Boolean(activeFilters);
  const expenses = usingFilters
    ? filteredExpensesQuery.data ?? []
    : latestExpensesQuery.data ?? [];
  const isLoading = usingFilters
    ? filteredExpensesQuery.isLoading
    : latestExpensesQuery.isLoading;
  const isError = usingFilters
    ? filteredExpensesQuery.isError
    : latestExpensesQuery.isError;
  const hasExpenses = expenses.length > 0;
  const showSpinner = (loadingBranches || isLoading) && !hasExpenses;
  const showFullError = isError && !hasExpenses;

  const handleSearch = () => {
    if (selectedBranchIds.length === 0 || !startDate || !endDate) {
      setValidationError("Selecciona sucursales y un rango de fechas.");
      return;
    }

    setValidationError(null);
    setActiveFilters({
      branchIds: selectedBranchIds,
      startDate,
      endDate,
    });
  };

  const handleClearFilters = () => {
    setSelectedBranchIds([]);
    setStartDate(new Date());
    setEndDate(new Date());
    setActiveFilters(null);
    setValidationError(null);
  };

  const handleCreated = (_expense: BranchExpenseResponseDTO) => undefined;

  const handleCreateClick = () => {
    setSelectedExpense(null);
    setShowModal(true);
  };

  const handleEditClick = (expense: BranchExpenseResponseDTO) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-gray-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Gastos de sucursales
          </h1>
          <p className="text-sm text-gray-400">
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
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      {validationError && (
        <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
          {validationError}
        </Alert>
      )}

      {showSpinner ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : showFullError ? (
        <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
          No se pudieron cargar los gastos.
        </Alert>
      ) : (
        <BranchExpensesList expenses={expenses} onSelect={handleEditClick} />
      )}

      <BranchExpenseModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExpense(null);
        }}
        expenseToEdit={selectedExpense}
        onCreated={handleCreated}
      />
    </div>
  );
}
