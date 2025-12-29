import { formatHumanDate } from "@/utils/date.utils";
import type { ExpenseResponseDTO } from "../types";

interface ExpensesListProps {
  expenses: ExpenseResponseDTO[];
  onSelect?: (expense: ExpenseResponseDTO) => void;
}

/* =======================
   Utils
======================= */

const formatCurrency = (amount: number) =>
  amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

export default function ExpensesList({
  expenses,
  onSelect,
}: ExpensesListProps) {
  if (!expenses.length) {
    return (
      <div className="py-4 text-center text-gray-400">
        No hay gastos registrados.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="cursor-pointer rounded-xl bg-gray-800 p-4 text-white shadow transition hover:bg-gray-700"
          onClick={() => onSelect?.(expense)}
        >
          {/* Header */}
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold">{expense.reason}</span>
            <span className="text-sm opacity-70">
              {formatHumanDate(expense.date)}
            </span>
          </div>

          {/* Body */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              {formatCurrency(expense.amount)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
