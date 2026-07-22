import { Link, useParams } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { useCashReserves } from "../api/generalCash.queries";
import { HiBanknotes } from "react-icons/hi2";

export default function GeneralCashSummaryWidget() {
  const { slug } = useParams();
  const reservesQuery = useCashReserves();
  const reserves = reservesQuery.data ?? [];

  const sorted = [...reserves].sort((a, b) => {
    const aScore =
      a.currentBalance < 0 ? 0 : a.currentBalance < a.alertThreshold ? 1 : 2;
    const bScore =
      b.currentBalance < 0 ? 0 : b.currentBalance < b.alertThreshold ? 1 : 2;
    if (aScore !== bScore) return aScore - bScore;
    return a.currentBalance - b.currentBalance;
  });

  const top5 = sorted.slice(0, 5);

  const totalBalance = reserves.reduce((sum, r) => sum + r.currentBalance, 0);

  const getBalanceColor = (balance: number, threshold: number) => {
    if (balance < 0) return "text-red-400";
    if (balance < threshold) return "text-amber-400";
    return "text-emerald-400";
  };

  const getDotColor = (balance: number, threshold: number) => {
    if (balance < 0) return "bg-red-400";
    if (balance < threshold) return "bg-amber-400";
    return "bg-emerald-400";
  };

  return (
    <div className="h-full rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiBanknotes className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200">Caja General</h2>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            $
            {totalBalance.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-500">Saldo total</div>
        </div>
      </div>

      {reservesQuery.isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
        </div>
      ) : top5.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500">
          No hay cajas registradas
        </div>
      ) : (
        <div className="space-y-2">
          {top5.map((r) => {
            const color = getBalanceColor(r.currentBalance, r.alertThreshold);
            const dotColor = getDotColor(r.currentBalance, r.alertThreshold);
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg bg-slate-900/40 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <span className="text-sm text-slate-300">{r.branchName}</span>
                </div>
                <span className={`text-sm font-semibold ${color}`}>
                  $
                  {r.currentBalance.toLocaleString("es-MX", {
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 border-t border-slate-700/40 pt-3">
        <Link
          to={`/business/${slug}/general-cash`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:gap-2"
        >
          Ver detalle
          <HiArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
