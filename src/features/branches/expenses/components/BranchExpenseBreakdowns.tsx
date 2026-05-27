import { formatMXN } from "@/utils/moneyNumbers";
import type { ExpenseSummaryItem } from "../utils/expense-summary";

interface Props {
  byBranch: ExpenseSummaryItem[];
  byBusinessUnit: ExpenseSummaryItem[];
  byExpenseCategory: ExpenseSummaryItem[];
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const BreakdownTable = ({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: ExpenseSummaryItem[];
  emptyLabel: string;
}) => (
  <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
    <div className="mb-4 flex items-center justify-between gap-2">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
        Ordenado por total
      </span>
    </div>

    {items.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
        {emptyLabel}
      </div>
    ) : (
      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Concepto</th>
              <th className="px-4 py-3 font-semibold">Monto</th>
              <th className="px-4 py-3 font-semibold">Movs</th>
              <th className="px-4 py-3 font-semibold">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {items.map((item, index) => (
              <tr key={`${item.label}-${index}`} className="hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-100">{item.label}</div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-100">
                  {formatMXN(item.totalAmount)}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {item.expenseCount.toLocaleString("es-MX")}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {formatPercent(item.percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default function BranchExpenseBreakdowns({
  byBranch,
  byBusinessUnit,
  byExpenseCategory,
}: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <BreakdownTable
        title="Desglose por sucursal"
        items={byBranch}
        emptyLabel="No hay datos por sucursal para el filtro actual."
      />
      <BreakdownTable
        title="Desglose por unidad de negocio"
        items={byBusinessUnit}
        emptyLabel="No hay datos por unidad de negocio para el filtro actual."
      />
      <div className="xl:col-span-2">
        <BreakdownTable
          title="Desglose por tipo de gasto"
          items={byExpenseCategory}
          emptyLabel="No hay datos por tipo de gasto para el filtro actual."
        />
      </div>
    </div>
  );
}
