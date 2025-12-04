import { Expense } from "../services/api.ts";

interface ExpensesListProps {
  expenses: Expense[];
  onSelect?: (expense: Expense) => void; // opcional, útil si luego quieres abrir un modal
}

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
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold">{expense.branch.name}</span>
            <span className="font-semibold">{expense.category.name}</span>
            <span className="text-sm opacity-70">{expense.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              ${expense.amount.toLocaleString()}
            </span>
            <span className="text-sm opacity-80">{expense.reason}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
