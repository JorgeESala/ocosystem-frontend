import { useEffect, useState } from "react";
import { Expense, fetchExpenses } from "../services/api";
import ExpensesList from "./ExpensesList";
import { Button } from "flowbite-react";
import ExpenseModal from "./ExpenseModal";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const loadExpenses = async () => {
    try {
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err) {
      setError("No se pudieron cargar los gastos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleCreated = (updated: Expense) => {
    setExpenses((prev) => {
      const exists = prev.some((e) => e.id === updated.id);

      return exists
        ? prev.map((e) => (e.id === updated.id ? updated : e))
        : [updated, ...prev];
    });
  };

  const handleCreateClick = () => {
    setSelectedExpense(null); // modo crear
    setShowModal(true);
  };

  const handleEditClick = (exp: Expense) => {
    setSelectedExpense(exp); // modo editar
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center text-gray-400">Cargando gastos...</div>
    );
  }

  if (error) {
    return <div className="py-6 text-center text-red-400">{error}</div>;
  }

  return (
    <div className="mx-auto mt-6 max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Gastos</h1>
        <Button onClick={handleCreateClick}>Nuevo gasto</Button>
      </div>

      {/* Lista con clic para editar */}
      <ExpensesList expenses={expenses} onSelect={handleEditClick} />

      {/* Modal que sirve para crear y editar */}
      <ExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        expenseToEdit={selectedExpense}
        onCreated={handleCreated}
      />
    </div>
  );
}
