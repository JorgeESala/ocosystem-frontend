import { Badge, Tooltip } from "flowbite-react";
import { HiPencil } from "react-icons/hi";
import { formatHumanDate } from "@/utils/date.utils";
import type { BranchExpenseResponseDTO } from "../types";

interface BranchExpensesListProps {
  expenses: BranchExpenseResponseDTO[];
  onSelect?: (expense: BranchExpenseResponseDTO) => void;
}

const formatCurrency = (amount: number) =>
  amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

export default function BranchExpensesList({
  expenses,
  onSelect,
}: BranchExpensesListProps) {
  if (!expenses.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 py-8 text-center text-sm text-gray-400">
        No hay gastos registrados.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          onClick={() => onSelect?.(expense)}
          className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-700 bg-gray-800 p-4 text-white shadow-sm transition hover:border-blue-500/40 hover:bg-gray-700"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="gray">{expense.branchName}</Badge>
              <Badge color="info">{expense.expenseCategoryName}</Badge>
              <Badge color="success">
                {expense.businessUnitCategoryName ?? expense.businessUnitName ?? "Unidad sin nombre"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-300">
              <span>{expense.reason}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold">
                {formatCurrency(expense.amount)}
              </div>
              <div className="text-xs text-gray-400">
                {formatHumanDate(expense.date)}
              </div>
            </div>

            <Tooltip content="Editar gasto">
              <HiPencil className="h-5 w-5 opacity-0 transition group-hover:opacity-100" />
            </Tooltip>
          </div>
        </li>
      ))}
    </ul>
  );
}
