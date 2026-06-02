import { useState } from "react";
import { Alert, Button, Spinner } from "flowbite-react";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseModal from "../components/ExpenseModal";
import ExpenseSummary from "../components/ExpenseSummary";
import ExpenseBreakdowns from "../components/ExpenseBreakdowns";
import ExpensesTable from "../components/ExpensesTable";
import { useLatestExpenses, useFilterExpenses } from "../api/expense.queries";
import { buildExpenseSummary } from "../utils/expense-summary";
import { EXPENSE_UNIT_CONFIG } from "../config/unitConfig";
import type {
  ExpenseResponseDTO,
  ExpensesUnitType,
} from "../types/expense.types";
import type { ExpenseCategoryCode, ExpenseType } from "@/core/api/types";
import { formatHumanDate } from "@/utils/date.utils";

interface ExpensesPageProps {
  unitType: ExpensesUnitType;
}

export default function ExpensesPage({ unitType }: ExpensesPageProps) {
  const config = EXPENSE_UNIT_CONFIG[unitType];

  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedCategoryCodes, setSelectedCategoryCodes] = useState<
    ExpenseCategoryCode[]
  >([]);
  const [selectedExpenseTypes, setSelectedExpenseTypes] = useState<
    ExpenseType[]
  >([]);
  const [activeDateFilters, setActiveDateFilters] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  const latestQuery = useLatestExpenses(unitType);
  const filterQuery = useFilterExpenses(unitType, activeDateFilters);

  const usingDateFilters = Boolean(activeDateFilters);
  const rawExpenses = usingDateFilters
    ? (filterQuery.data ?? [])
    : (latestQuery.data ?? []);
  const isLoading = usingDateFilters
    ? filterQuery.isLoading
    : latestQuery.isLoading;
  const isError = usingDateFilters ? filterQuery.isError : latestQuery.isError;

  const hasCategoryFilter = selectedCategoryCodes.length > 0;
  const hasTypeFilter = selectedExpenseTypes.length > 0;

  const displayedExpenses = rawExpenses.filter((e) => {
    if (!hasCategoryFilter && !hasTypeFilter) return true;
    const matchesCategory = hasCategoryFilter
      ? selectedCategoryCodes.includes(e.categoryCode)
      : false;
    const matchesType = hasTypeFilter
      ? selectedExpenseTypes.includes(e.expenseType)
      : false;
    return matchesCategory || matchesType;
  });

  const showSpinner = isLoading && !rawExpenses.length;
  const showFullError = isError && !rawExpenses.length;

  const summary = buildExpenseSummary(displayedExpenses);

  const scopeLabel = (() => {
    const parts: string[] = [];
    if (activeDateFilters) {
      parts.push(
        `Rango ${formatHumanDate(activeDateFilters.start, "short")} - ${formatHumanDate(activeDateFilters.end, "short")}`,
      );
    } else {
      parts.push("Ultimos gastos cargados");
    }
    const filterCount =
      selectedCategoryCodes.length + selectedExpenseTypes.length;
    if (filterCount > 0) {
      parts.push(
        `${filterCount} filtro${filterCount > 1 ? "s" : ""} activo${filterCount > 1 ? "s" : ""}`,
      );
    }
    return parts.join(" | ");
  })();

  const handleSearch = () => {
    if (!startDate || !endDate) return;
    setActiveDateFilters({ start: startDate, end: endDate });
  };

  const handleClearFilters = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setSelectedCategoryCodes([]);
    setSelectedExpenseTypes([]);
    setActiveDateFilters(null);
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
        selectedCategoryCodes={selectedCategoryCodes}
        onCategoryCodesChange={setSelectedCategoryCodes}
        selectedExpenseTypes={selectedExpenseTypes}
        onExpenseTypesChange={setSelectedExpenseTypes}
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

      {isError && rawExpenses.length > 0 && (
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
        <ExpensesTable
          expenses={displayedExpenses}
          onSelect={handleEditClick}
        />
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
