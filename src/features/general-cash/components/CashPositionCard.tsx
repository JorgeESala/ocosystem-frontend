import type { CashReserveResponseDTO } from "../types";

interface Props {
  reserve: CashReserveResponseDTO;
}

export default function CashPositionCard({ reserve }: Props) {
  const change = reserve.currentBalance - reserve.startingBalance;
  const changePercent =
    reserve.startingBalance !== 0
      ? (change / reserve.startingBalance) * 100
      : 0;
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <div className="mb-1 text-sm font-medium text-slate-400">
        {reserve.branchName}
      </div>
      <div className="text-2xl font-bold text-white">
        $
        {reserve.currentBalance.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
        })}
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm">
        <span className={isPositive ? "text-emerald-400" : "text-red-400"}>
          {isPositive ? "+" : ""}$
          {change.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </span>
        <span className="text-slate-500">
          ({isPositive ? "+" : ""}
          {changePercent.toFixed(1)}%)
        </span>
      </div>
      {reserve.lastCalculatedAt && (
        <div className="mt-3 text-xs text-slate-500">
          Ultimo calculo:{" "}
          {new Date(reserve.lastCalculatedAt).toLocaleDateString("es-MX")}
        </div>
      )}
    </div>
  );
}
