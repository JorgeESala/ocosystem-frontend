import {
  HiOfficeBuilding,
  HiCash,
  HiGlobeAlt,
  HiTrendingUp,
} from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import type { CashFlowSummary } from "../types/eggCashFlow.types";
import { accountLabelShort } from "../utils/cashFlow.utils";

interface Props {
  summary: CashFlowSummary | undefined;
  accountHolder: string;
}

export default function CashFlowBalanceCards({
  summary,
  accountHolder,
}: Props) {
  if (!summary) return null;

  const periodIncome = summary.totalCollections + summary.totalCashAdjustments;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-slate-800 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HiCash className="h-4 w-4 text-amber-400" />
          Efectivo en oficina
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {formatMXN(summary.cashClosingBalance)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Lo que quedó en la oficina
        </div>
      </div>

      <div className="rounded-xl bg-slate-800 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HiGlobeAlt className="h-4 w-4 text-blue-400" />
          {accountLabelShort(accountHolder)}
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {formatMXN(summary.bankClosingBalance)}
        </div>
        <div className="mt-1 text-xs text-slate-500">Saldo de la cuenta</div>
      </div>

      <div className="rounded-xl bg-slate-800 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HiTrendingUp className="h-4 w-4 text-emerald-400" />
          Cobranza del periodo
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {formatMXN(periodIncome)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Cobranza + ajustes del periodo
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HiOfficeBuilding className="h-4 w-4 text-emerald-400" />
          Efectivo + cuenta
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {formatMXN(summary.totalBalance)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Suma de oficina y cuenta
        </div>
        <div className="mt-2 text-xs font-medium text-amber-300">
          Deuda con remesas: {formatMXN(summary.remesaDebtTotal)}
        </div>
      </div>
    </div>
  );
}
