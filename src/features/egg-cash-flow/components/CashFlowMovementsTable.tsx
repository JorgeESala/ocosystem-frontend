import { useState } from "react";
import { Badge, Tooltip } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDate } from "../utils/cashFlow.utils";
import type { CashFlowMovement } from "../types/eggCashFlow.types";

const CATEGORY_LABELS: Record<string, string> = {
  TRIP_COLLECTION: "Despacho",
  PAYMENT_COLLECTION: "Cobro",
  CLIENT_COLLECTION: "Cliente",
  OTHER_INCOME: "Otro ingreso",
  CASH_EXPENSE: "Gasto en efectivo",
  DEPOSIT: "Depósito",
  REMESA_PAYMENT: "Pago remesa",
  ADJUSTMENT: "Ajuste",
};

const CATEGORY_COLORS: Record<string, string> = {
  TRIP_COLLECTION: "green",
  PAYMENT_COLLECTION: "green",
  CLIENT_COLLECTION: "green",
  OTHER_INCOME: "gray",
  CASH_EXPENSE: "red",
  DEPOSIT: "blue",
  REMESA_PAYMENT: "purple",
  ADJUSTMENT: "yellow",
};

const ACCOUNT_LABELS: Record<string, string> = {
  CASH: "Caja chica",
  BANK: "Caja general",
};

interface Props {
  movements: CashFlowMovement[] | undefined;
  onDelete: (id: number) => void;
  accountFilter: string;
}

export default function CashFlowMovementsTable({
  movements,
  onDelete,
  accountFilter,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = movements?.filter(
    (m) => accountFilter === "ALL" || m.account === accountFilter,
  );

  const handleDelete = (id: number) => {
    setConfirmDelete(null);
    onDelete(id);
  };

  if (!filtered?.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 py-10 text-center text-sm text-slate-400">
        No hay movimientos en este periodo.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h3 className="text-base font-semibold text-white">Movimientos</h3>
        <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          {filtered.length.toLocaleString("es-MX")} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Fecha</th>
              <th className="px-5 py-3 font-semibold">Tipo</th>
              <th className="px-5 py-3 font-semibold">Categoría</th>
              <th className="px-5 py-3 font-semibold">Concepto</th>
              <th className="px-5 py-3 font-semibold">Folio</th>
              <th className="px-5 py-3 font-semibold">Cuenta</th>
              <th className="px-5 py-3 text-right font-semibold">Monto</th>
              <th className="px-5 py-3 text-right font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {filtered.map((m) => (
              <tr key={m.id} className="group transition hover:bg-slate-900/50">
                <td className="px-5 py-3 text-sm whitespace-nowrap text-slate-300">
                  {formatDate(m.movementDate)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-sm font-medium ${
                      m.direction === "IN" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {m.direction === "IN" ? "Ingreso" : "Egreso"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    color={(CATEGORY_COLORS[m.category] as never) ?? "gray"}
                    className="inline-flex"
                  >
                    {CATEGORY_LABELS[m.category] ?? m.category}
                  </Badge>
                </td>
                <td className="max-w-[240px] px-5 py-3 text-sm text-slate-300">
                  <div className="truncate">{m.description ?? "—"}</div>
                  {m.note && (
                    <div className="truncate text-xs text-slate-500">
                      {m.note}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-slate-400">
                  {m.folio ?? "—"}
                </td>
                <td className="px-5 py-3 text-sm text-slate-400">
                  {ACCOUNT_LABELS[m.account] ?? m.account}
                </td>
                <td
                  className={`px-5 py-3 text-right font-mono text-sm font-semibold whitespace-nowrap ${
                    m.direction === "IN" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {m.direction === "IN" ? "+" : "−"}
                  {formatMXN(m.amount)}
                </td>
                <td className="px-5 py-3 text-right">
                  {m.category === "REMESA_PAYMENT" ? null : confirmDelete ===
                    m.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="rounded bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-500"
                      >
                        Si
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded bg-slate-600 px-2 py-0.5 text-xs text-white hover:bg-slate-500"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <Tooltip content="Eliminar movimiento">
                      <button
                        onClick={() => setConfirmDelete(m.id)}
                        className="ml-auto text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
