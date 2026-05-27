import { Badge, Tooltip } from "flowbite-react";
import { HiPencil } from "react-icons/hi";
import { formatHumanDate } from "@/utils/date.utils";
import type { BranchExpenseResponseDTO } from "../types";

interface BranchExpensesTableProps {
  expenses: BranchExpenseResponseDTO[];
  onSelect?: (expense: BranchExpenseResponseDTO) => void;
}

const formatCurrency = (amount: number) =>
  amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

export default function BranchExpensesTable({
  expenses,
  onSelect,
}: BranchExpensesTableProps) {
  if (!expenses.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 py-10 text-center text-sm text-slate-400">
        No hay gastos registrados.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-white">Detalle de gastos</h3>
          <p className="text-sm text-slate-400">
            Ordenado para revision rapida y edicion directa.
          </p>
        </div>
        <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          {expenses.length.toLocaleString("es-MX")} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Fecha</th>
              <th className="px-5 py-3 font-semibold">Sucursal</th>
              <th className="px-5 py-3 font-semibold">Tipo</th>
              <th className="px-5 py-3 font-semibold">Unidad</th>
              <th className="px-5 py-3 font-semibold">Motivo</th>
              <th className="px-5 py-3 font-semibold text-right">Monto</th>
              <th className="px-5 py-3 font-semibold text-right">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                onClick={() => onSelect?.(expense)}
                className="group cursor-pointer transition hover:bg-slate-900/50"
              >
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">
                  {formatHumanDate(expense.date, "short")}
                </td>
                <td className="px-5 py-4">
                  <Badge color="gray" className="inline-flex">
                    {expense.branchName}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge color="info" className="inline-flex">
                    {expense.expenseCategoryName}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge color="success" className="inline-flex">
                    {expense.businessUnitCategoryName ?? expense.businessUnitName ?? "Sin unidad"}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-sm text-slate-200">
                  <div className="max-w-[18rem] truncate">{expense.reason}</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-base font-semibold text-white">
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
    </section>
  );
}
