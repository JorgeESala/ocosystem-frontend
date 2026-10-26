import { useState } from "react";
import { Button } from "flowbite-react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDate } from "../utils/cashFlow.utils";
import type { CashFlowCut } from "../types/eggCashFlow.types";

interface Props {
  cuts: CashFlowCut[];
  onReopen?: (id: number) => void;
}

export default function CutsPanel({ cuts, onReopen }: Props) {
  const [confirmReopen, setConfirmReopen] = useState<number | null>(null);

  if (cuts.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <h3 className="text-base font-semibold text-white">Cortes de semana</h3>
        <p className="mt-1 text-sm text-slate-400">
          No hay cortes registrados. Usa "Corte de semana" para cerrar una
          semana que ya termino.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70">
      <div className="border-b border-slate-800 px-5 py-4">
        <h3 className="text-base font-semibold text-white">Cortes de semana</h3>
        <p className="mt-1 text-sm text-slate-400">
          Solo el ultimo corte se puede reabrir para corregir su semana.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Semana</th>
              <th className="px-5 py-3 text-right font-semibold">
                Caja chica (ingreso)
              </th>
              <th className="px-5 py-3 text-right font-semibold">
                Cierre caja chica
              </th>
              <th className="px-5 py-3 text-right font-semibold">Banco</th>
              <th className="px-5 py-3 text-right font-semibold">
                Deuda remesas (proveedores)
              </th>
              <th className="px-5 py-3 text-right font-semibold">Saldo real</th>
              <th className="px-5 py-3 text-right font-semibold">Diferencia</th>
              <th className="px-5 py-3 font-semibold">Nota</th>
              <th className="px-5 py-3 text-right font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {cuts.map((c, index) => (
              <tr key={c.id} className="transition hover:bg-slate-900/50">
                <td className="px-5 py-3 text-sm whitespace-nowrap text-slate-300">
                  {formatDate(c.weekStart)} — {formatDate(c.weekEnd)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-emerald-400">
                  {formatMXN(c.totalDeposits)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-slate-300">
                  {formatMXN(c.cashClosingBalance)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-white">
                  {formatMXN(c.bankClosingBalance)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-amber-400">
                  {formatMXN(c.remesaDebtTotal)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-slate-300">
                  {c.realBankBalance != null
                    ? formatMXN(c.realBankBalance)
                    : "—"}
                </td>
                <td
                  className={`px-5 py-3 text-right font-mono text-sm ${
                    c.bankDifference == null
                      ? "text-slate-500"
                      : c.bankDifference >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                  }`}
                >
                  {c.bankDifference != null ? formatMXN(c.bankDifference) : "—"}
                </td>
                <td className="px-5 py-3 text-sm text-slate-400">
                  {c.note ?? "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  {index === 0 && onReopen ? (
                    confirmReopen === c.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="xs"
                          color="failure"
                          onClick={() => {
                            setConfirmReopen(null);
                            onReopen(c.id);
                          }}
                        >
                          Si
                        </Button>
                        <Button
                          size="xs"
                          color="gray"
                          onClick={() => setConfirmReopen(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => setConfirmReopen(c.id)}
                      >
                        Reabrir
                      </Button>
                    )
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
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
