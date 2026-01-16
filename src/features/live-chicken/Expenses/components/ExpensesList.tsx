import { Badge, Tooltip } from "flowbite-react";
import { HiPencil } from "react-icons/hi";
import { formatHumanDate } from "@/utils/date.utils";
import type { ExpenseResponseDTO } from "../types/expense.types";
import { VehicleExpenseCategoryLabel } from "../api/vehicle-expense-category.labels";

interface ExpensesListProps {
  expenses: ExpenseResponseDTO[];
  onSelect?: (expenseId: number) => void;
}

/* =======================
   Utils
======================= */

const formatCurrency = (amount: number) =>
  amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const categoryColor: Record<string, string> = {
  FOOD: "success",
  VEHICLE: "warning",
  FUEL: "info",
  GENERIC: "gray",
};

const vehicleCategoryLabel: Record<string, string> = {
  MAINTENANCE: "Mantenimiento",
  REPAIR: "Reparación",
  OTHER: "Otro",
};

export default function ExpensesList({
  expenses,
  onSelect,
}: ExpensesListProps) {
  if (!expenses.length) {
    return (
      <div className="py-6 text-center text-sm text-gray-400">
        No hay gastos registrados.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          onClick={() => onSelect?.(expense.id)}
          className="group flex cursor-pointer items-center justify-between rounded-xl bg-gray-800 p-4 text-white shadow-sm transition hover:bg-gray-700"
        >
          {/* Left */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge color={categoryColor[expense.expenseType] ?? "gray"}>
                {expense.categoryName}
              </Badge>
              <span className="font-medium">{expense.reason}</span>
            </div>

            {/* Extra info */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-300">
              {/* Vehículo */}
              {expense.vehicleName && <span>🚚 {expense.vehicleName}</span>}

              {/* Tipo gasto vehículo */}
              {expense.vehicleCategory && (
                <span>
                  🛠️{" "}
                  {vehicleCategoryLabel[expense.vehicleCategory] ??
                    VehicleExpenseCategoryLabel[expense.vehicleCategory]}
                </span>
              )}

              {/* Chofer */}
              {expense.employeeName && <span>👤 {expense.employeeName}</span>}

              {/* Ruta */}
              {expense.routeName && <span>🛣 {expense.routeName}</span>}

              {/* Alimento */}
              {expense.weight && <span>⚖️ {expense.weight} kg</span>}

              {/* CEDIS */}
              {expense.cedisName && <span>🏭 {expense.cedisName}</span>}
            </div>
          </div>

          {/* Right */}
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
