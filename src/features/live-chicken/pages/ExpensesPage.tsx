import { useState } from "react";
import { Button, Datepicker } from "flowbite-react";

import ExpensesList from "../Expenses/components/ExpensesList";
import ExpenseEntryModal from "../Expenses/components/ExpenseEntryModal";
import {
  useExpenseById,
  useLatestExpenses,
} from "../Expenses/api/expense.queries";

export default function ExpensesPage() {
  /* =======================
     Modales / selección
  ======================= */
  const [showModal, setShowModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null,
  );

  /* =======================
     Filtros (UI solamente)
  ======================= */
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  console.log(startDate, endDate);
  /* =======================
     Data
  ======================= */
  const { data: expenses = [], isLoading, isError } = useLatestExpenses();
  const { data: expenseToEdit, isLoading: loadingExpense } =
    useExpenseById(selectedExpenseId);

  /* =======================
     Handlers
  ======================= */
  const handleCreateClick = () => {
    setSelectedExpenseId(null);
    setShowModal(true);
  };

  const handleEditClick = (expenseId: number) => {
    setSelectedExpenseId(expenseId);
    setShowModal(true);
  };

  return (
    <div className="mx-auto mt-6 max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Gastos</h1>
        <Button onClick={handleCreateClick}>Nuevo gasto</Button>
      </div>

      {/* --- Fechas --- */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-white">
        <div>
          <label>Inicio</label>
          <Datepicker onChange={(d) => setStartDate(d)} />
        </div>

        <div>
          <label>Fin</label>
          <Datepicker onChange={(d) => setEndDate(d)} />
        </div>
      </div>

      <div className="mt-4">
        <Button fullSized disabled>
          Buscar
        </Button>
      </div>

      {isLoading && (
        <div className="py-4 text-center text-gray-400">Cargando gastos...</div>
      )}

      {isError && (
        <div className="py-4 text-center text-red-400">
          No se pudieron cargar los gastos.
        </div>
      )}

      {!isLoading && !isError && (
        <ExpensesList expenses={expenses} onSelect={handleEditClick} />
      )}
      <ExpenseEntryModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExpenseId(null);
        }}
        expenseToEdit={expenseToEdit}
        loading={loadingExpense}
      />
    </div>
  );
}
