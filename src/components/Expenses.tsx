import { useEffect, useState } from "react";
import {
  Expense,
  fetchExpensesByBranchesAndDateRange,
  fetchLatestExpenses,
} from "../services/api";
import ExpensesList from "./ExpensesList";
import { Button, Datepicker } from "flowbite-react";
import ExpenseModal from "./ExpenseModal";
import BranchMultiSelect from "./BranchMultiSelect";
import { useBranches } from "@/features/branches/branch/branch.queries";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data: branches } = useBranches();
  // --- filtros ---
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Cargar gastos con filtros
  const loadFilteredExpenses = async () => {
    if (selectedBranches.length === 0 || !startDate || !endDate) {
      setError("Selecciona sucursales y un rango de fechas.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchExpensesByBranchesAndDateRange(
        selectedBranches,
        startDate,
        endDate,
      );
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los gastos filtrados.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar gastos iniciales
  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loadLatestExpenses = async () => {
      setIsLoading(true);
      try {
        const latestExpenses = await fetchLatestExpenses();
        setExpenses(latestExpenses);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los gastos.");
      } finally {
        setIsLoading(false);
      }
    };
    loadLatestExpenses();
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
    setSelectedExpense(null);
    setShowModal(true);
  };

  const handleEditClick = (exp: Expense) => {
    setSelectedExpense(exp);
    setShowModal(true);
  };

  return (
    <div className="mx-auto mt-6 max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Gastos</h1>
        <Button onClick={handleCreateClick}>Nuevo gasto</Button>
      </div>

      {/* --- Select de sucursales --- */}
      {branches && (
        <BranchMultiSelect
          branches={branches}
          selected={selectedBranches}
          onChange={setSelectedBranches}
        />
      )}

      {/* --- Fechas --- */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-white">
        <div>
          <label>Inicio</label>
          <Datepicker onChange={(d) => setStartDate(d)} language="es-Mx" />
        </div>

        <div>
          <label>Fin</label>
          <Datepicker onChange={(d) => setEndDate(d)} language="es-Mx" />
        </div>
      </div>

      <div className="mt-4">
        <Button fullSized onClick={loadFilteredExpenses}>
          Buscar
        </Button>
      </div>

      {isLoading && (
        <div className="py-4 text-center text-gray-400">Cargando gastos...</div>
      )}

      {error && <div className="py-4 text-center text-red-400">{error}</div>}

      {!isLoading && !error && (
        <ExpensesList expenses={expenses} onSelect={handleEditClick} />
      )}

      <ExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        expenseToEdit={selectedExpense}
        onCreated={handleCreated}
      />
    </div>
  );
}
