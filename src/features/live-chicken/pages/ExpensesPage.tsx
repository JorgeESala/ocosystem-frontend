import { useState } from "react";
import { Button, Datepicker } from "flowbite-react";

import ExpensesList from "../components/ExpensesList";
import type { ExpenseResponseDTO } from "../types";
import { useLatestExpenses } from "../api/expense.queries";
import ExpenseEntryModal from "../Expenses/components/ExpenseEntryModal";

export default function ExpensesPage() {
  /* =======================
     Modales / selección
  ======================= */
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseResponseDTO | null>(null);

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

  /* =======================
     Handlers
  ======================= */
  const handleCreateClick = () => {
    setSelectedExpense(null);
    setShowModal(true);
  };

  const handleEditClick = (expense: ExpenseResponseDTO) => {
    setSelectedExpense(expense);
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
        onClose={() => setShowModal(false)}
        expenseToEdit={selectedExpense}
      />
      {/* <ExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        expenseToEdit={selectedExpense}
      /> */}
    </div>
  );
}
