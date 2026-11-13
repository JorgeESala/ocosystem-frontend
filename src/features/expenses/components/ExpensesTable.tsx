import { useMemo, useState } from "react";
import { Badge, TextInput, Tooltip } from "flowbite-react";
import { HiPencil, HiSearch } from "react-icons/hi";
import TablePagination from "@/components/TablePagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { formatHumanDate } from "@/utils/date.utils";
import { ExpenseTypeLabels } from "@/core/api/types";
import { CATEGORY_BADGE_COLORS } from "../config/filterConfig";
import type { ExpenseResponseDTO } from "../types/expense.types";

const vehicleCategoryLabel: Record<string, string> = {
  MAINTENANCE: "Mantenimiento",
  REPAIRMENT: "Reparacion",
  OTHER: "Otro",
};

interface ExpensesTableProps {
  expenses: ExpenseResponseDTO[];
  onSelect?: (expense: ExpenseResponseDTO) => void;
  resetKey?: string;
}

const formatCurrency = (amount: number) =>
  amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

export default function ExpensesTable({
  expenses,
  onSelect,
  resetKey = "",
}: ExpensesTableProps) {
  const [query, setQuery] = useState("");
  const filteredExpenses = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return expenses;
    return expenses.filter((expense) =>
      [
        expense.reason,
        expense.categoryName,
        ExpenseTypeLabels[expense.expenseType],
        expense.vehicleName,
        expense.employeeName,
        expense.routeName,
        expense.cedisName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [expenses, query]);
  const pager = useClientPagination(filteredExpenses, {
    pageSize: 25,
    resetKey: `${query}|${resetKey}`,
  });

  if (!expenses.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 py-10 text-center text-sm text-slate-400">
        No hay gastos registrados.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Detalle de gastos
          </h3>
          <p className="text-sm text-slate-400">
            Ordenado para revision rapida y edicion directa.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TextInput
            icon={HiSearch}
            sizing="sm"
            placeholder="Buscar en gastos..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full sm:w-64"
          />
          <span className="text-xs font-semibold tracking-[0.18em] whitespace-nowrap text-slate-500 uppercase">
            {filteredExpenses.length.toLocaleString("es-MX")} registros
          </span>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-400">
          No hay gastos que coincidan con la búsqueda.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Gasto</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Detalles</th>
                  <th className="px-5 py-3 font-semibold">Motivo</th>
                  <th className="px-5 py-3 text-right font-semibold">Monto</th>
                  <th className="px-5 py-3 text-right font-semibold">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {pager.pageItems.map((expense) => (
                  <tr
                    key={expense.id}
                    onClick={() => onSelect?.(expense)}
                    className="group cursor-pointer transition hover:bg-slate-900/50"
                  >
                    <td className="px-5 py-4 text-sm whitespace-nowrap text-slate-300">
                      {formatHumanDate(expense.date, "short")}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        color={
                          (CATEGORY_BADGE_COLORS[
                            expense.categoryCode
                          ] as any) ?? "gray"
                        }
                        className="inline-flex"
                      >
                        {expense.categoryName}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color="gray" className="inline-flex text-xs">
                        {ExpenseTypeLabels[expense.expenseType] ??
                          expense.expenseType}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 text-xs text-slate-400">
                        {expense.vehicleName && (
                          <Badge color="gray" className="inline-flex text-xs">
                            {expense.vehicleName}
                          </Badge>
                        )}
                        {expense.employeeName && (
                          <Badge color="gray" className="inline-flex text-xs">
                            {expense.employeeName}
                          </Badge>
                        )}
                        {expense.routeName && (
                          <Badge color="gray" className="inline-flex text-xs">
                            {expense.routeName}
                          </Badge>
                        )}
                        {expense.cedisName && (
                          <Badge color="gray" className="inline-flex text-xs">
                            {expense.cedisName}
                          </Badge>
                        )}
                        {expense.weight != null && (
                          <Badge color="gray" className="inline-flex text-xs">
                            {expense.weight} kg
                          </Badge>
                        )}
                        {expense.vehicleCategory && (
                          <Badge color="gray" className="inline-flex text-xs">
                            {vehicleCategoryLabel[expense.vehicleCategory] ??
                              expense.vehicleCategory}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-200">
                      <div className="max-w-[18rem] truncate">
                        {expense.reason || "Sin descripcion"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-base font-semibold whitespace-nowrap text-white">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Tooltip content="Editar gasto">
                        <HiPencil className="ml-auto h-5 w-5 text-slate-400 opacity-0 transition group-hover:opacity-100" />
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={pager.page}
            pageSize={pager.pageSize}
            total={pager.total}
            onPageChange={pager.setPage}
            onPageSizeChange={pager.setPageSize}
          />
        </>
      )}
    </section>
  );
}
