import { useState } from "react";
import { Alert, Button, Spinner } from "flowbite-react";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseModal from "../components/ExpenseModal";
import ExpenseSummary from "../components/ExpenseSummary";
import ExpenseBreakdowns from "../components/ExpenseBreakdowns";
import ExpensesTable from "../components/ExpensesTable";
import {
  useLatestExpenses,
  useSearchExpenses,
} from "../api/expense.queries";
import { buildExpenseSummary } from "../utils/expense-summary";
import { EXPENSE_UNIT_CONFIG } from "../config/unitConfig";
import type {
  ExpenseFilters as ExpenseFilterState,
  ExpenseResponseDTO,
  ExpensesUnitType,
} from "../types/expense.types";
import { formatHumanDate } from "@/utils/date.utils";

interface ExpensesPageProps {
  unitType: ExpensesUnitType;
}

export default function ExpensesPage({ unitType }: ExpensesPageProps) {
  const config = EXPENSE_UNIT_CONFIG[unitType];

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [activeFilters, setActiveFilters] =
    useState<ExpenseFilterState | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  const latestQuery = useLatestExpenses(unitType);
  const searchQuery = useSearchExpenses(unitType, activeFilters);

  const usingFilters = Boolean(activeFilters);
  const expenses = usingFilters
    ? searchQuery.data ?? []
    : latestQuery.data ?? [];
  const isLoading = usingFilters
    ? searchQuery.isLoading
    : latestQuery.isLoading;
  const isError = usingFilters ? searchQuery.isError : latestQuery.isError;
  const hasExpenses = expenses.length > 0;
  const showSpinner = isLoading && !hasExpenses;
  const showFullError = isError && !hasExpenses;

  const summary = buildExpenseSummary(expenses);

  const scopeLabel = usingFilters
    ? `Rango ${formatHumanDate(startDate ?? new Date(), "short")} - ${formatHumanDate(endDate ?? new Date(), "short")}`
    : "Ultimos gastos cargados";

  const handleSearch = () => {
    if (!startDate || !endDate) return;
    setActiveFilters({ startDate, endDate });
  };

  const handleClearFilters = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setActiveFilters(null);
  };

  const handleCreateClick = () => {
    setSelectedExpenseId(null);
    setShowModal(true);
  };

  const handleEditClick = (expense: ExpenseResponseDTO) => {
    setSelectedExpenseId(expense.id);
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Gastos de {config.label}
          </h1>
          <p className="text-sm text-slate-400">{config.description}</p>
        </div>
        <Button onClick={handleCreateClick}>Nuevo gasto</Button>
      </header>

      <ExpenseFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      <ExpenseSummary
        totalAmount={summary.totalAmount}
        expenseCount={summary.expenseCount}
        averageAmount={summary.averageAmount}
        scopeLabel={scopeLabel}
        topCategory={summary.topCategory?.label}
      />

      <ExpenseBreakdowns
        byCategory={summary.byCategory}
        byExpenseType={summary.byExpenseType}
      />

      {isError && hasExpenses && (
        <Alert
          color="warning"
          className="border border-amber-900/40 bg-amber-950/40 text-amber-100"
        >
          No se pudo refrescar el origen. Se muestran los gastos ya cargados.
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
        <ExpensesTable expenses={expenses} onSelect={handleEditClick} />
      )}

      <ExpenseModal
        unitType={unitType}
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExpenseId(null);
        }}
        expenseIdToEdit={selectedExpenseId}
      />
    </div>
  );
}