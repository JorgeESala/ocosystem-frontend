import { Badge, Button } from "flowbite-react";
import { HiCreditCard } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDate } from "../utils/cashFlow.utils";
import type { Remesa } from "../types/eggCashFlow.types";

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: "red",
  PARCIAL: "yellow",
  PAGADA: "green",
};

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  PAGADA: "Pagada",
};

interface Props {
  remesas: Remesa[];
  onPay: (remesa: Remesa) => void;
}

export default function RemesasPanel({ remesas, onPay }: Props) {
  const openRemesas = remesas.filter((r) => r.status !== "PAGADA");
  const totalDebt = openRemesas.reduce((sum, r) => sum + r.balance, 0);

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Remesas por pagar
          </h3>
          <p className="text-sm text-slate-400">
            Remesas (lotes) con saldo pendiente en cuentas por pagar.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Deuda total</div>
          <div className="font-mono text-lg font-bold text-amber-400">
            {formatMXN(totalDebt)}
          </div>
        </div>
      </div>

      {openRemesas.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">
          No hay remesas pendientes de pago.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Remesa</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Proveedor</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Pagado</th>
                <th className="px-4 py-3 text-right font-semibold">Saldo</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {openRemesas.map((r) => (
                <tr
                  key={r.accountsPayableId}
                  className="group transition hover:bg-slate-900/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    Remesa #{r.batchId}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {formatDate(r.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {r.supplierName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-slate-300">
                    {formatMXN(r.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-emerald-400">
                    {formatMXN(r.paid)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-amber-400">
                    {formatMXN(r.balance)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      color={(STATUS_COLORS[r.status] as never) ?? "gray"}
                      className="inline-flex"
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="xs" onClick={() => onPay(r)}>
                      <HiCreditCard className="mr-1 h-3 w-3" />
                      Pagar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
