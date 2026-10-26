import { HiOfficeBuilding, HiCash, HiGlobeAlt } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import type { CashFlowSummary } from "../types/eggCashFlow.types";

interface Props {
  summary: CashFlowSummary | undefined;
  accountHolder: string;
}

export default function CashFlowBalanceCards({
  summary,
  accountHolder,
}: Props) {
  if (!summary) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl bg-slate-800 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HiCash className="h-4 w-4 text-amber-400" />
          Caja chica
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {formatMXN(summary.cashClosingBalance)}
        </div>
        <div className="mt-1 text-xs text-slate-500">Efectivo en oficina</div>
      </div>

      <div className="rounded-xl bg-slate-800 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HiGlobeAlt className="h-4 w-4 text-blue-400" />
          Banco
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {formatMXN(summary.bankClosingBalance)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Cuenta de {accountHolder}
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HiOfficeBuilding className="h-4 w-4 text-emerald-400" />
          Total
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {formatMXN(summary.totalBalance)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Deuda con remesas: {formatMXN(summary.remesaDebtTotal)}
        </div>
      </div>
    </div>
  );
}
