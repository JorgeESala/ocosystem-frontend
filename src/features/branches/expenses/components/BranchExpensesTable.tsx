import { useMemo, useState } from "react";
import { Badge, TextInput, Tooltip } from "flowbite-react";
import { HiPencil, HiSearch } from "react-icons/hi";
import { InfoTip } from "@/components/InfoTip";
import TablePagination from "@/components/TablePagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { formatHumanDate } from "@/utils/date.utils";
import type { BranchExpenseResponseDTO } from "../types";

interface BranchExpensesTableProps {
  expenses: BranchExpenseResponseDTO[];
  onSelect?: (expense: BranchExpenseResponseDTO) => void;
  resetKey?: string;
}

const formatCurrency = (amount: number) =>
  amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

export default function BranchExpensesTable({
  expenses,
  onSelect,
  resetKey = "",
}: BranchExpensesTableProps) {
  const [query, setQuery] = useState("");
  const filteredExpenses = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return expenses;
    return expenses.filter((expense) =>
      [
        expense.reason,
        expense.branchName,
        expense.expenseCategoryName,
        expense.businessUnitCategoryName,
        expense.businessUnitName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [expenses, query]);
  const pager = useClientPagination(filteredExpenses, {
    pageSize: 25,
    resetKey: `${query}|${resetKey}`,
  });
  const total = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );

  if (!expenses.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 py-10 text-center text-sm text-slate-400">
        No hay gastos registrados.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70">
      <div className="flex flex-col gap-2 border-b border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <TextInput
          icon={HiSearch}
          sizing="sm"
          placeholder="Buscar en gastos..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full sm:w-64"
        />
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] whitespace-nowrap text-slate-500 uppercase">
          {filteredExpenses.length.toLocaleString("es-MX")} registros
          <InfoTip title="Alcance de la búsqueda" align="right">
            Total de resultados de la búsqueda de esta tabla. No cambia el
            resumen ni la comparativa de arriba.
          </InfoTip>
        </span>
      </div>

      {filteredExpenses.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-400">
          No hay gastos que coincidan con la búsqueda.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Fecha</th>
                  <th className="px-4 py-2.5 font-semibold">Sucursal</th>
                  <th className="px-4 py-2.5 font-semibold">Tipo</th>
                  <th className="px-4 py-2.5 font-semibold">Unidad</th>
                  <th className="px-4 py-2.5 font-semibold">Motivo</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Monto
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Accion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {pager.pageItems.map((expense) => (
                  <tr
                    key={expense.id}
                    onClick={() => onSelect?.(expense)}
                    className="group cursor-pointer transition hover:bg-slate-900/50"
                  >
                    <td className="px-4 py-2.5 text-sm whitespace-nowrap text-slate-300">
                      {formatHumanDate(expense.date, "short")}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge color="gray" className="inline-flex">
                        {expense.branchName}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge color="info" className="inline-flex">
                        {expense.expenseCategoryName}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge color="success" className="inline-flex">
                        {expense.businessUnitCategoryName ??
                          expense.businessUnitName ??
                          "Sin unidad"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-200">
                      <div className="max-w-[18rem] truncate">
                        {expense.reason}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold whitespace-nowrap text-white">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Tooltip content="Editar gasto">
                        <HiPencil className="ml-auto h-4 w-4 text-slate-400 opacity-0 transition group-hover:opacity-100" />
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-600 bg-slate-900/50 font-semibold">
                  <td colSpan={5} className="px-4 py-2.5 text-slate-100">
                    Total de resultados
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold whitespace-nowrap text-white">
                    {formatCurrency(total)}
                  </td>
                  <td className="px-4 py-2.5" />
                </tr>
              </tfoot>
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
