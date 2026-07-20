import type { CashReserveResponseDTO } from "../types";

interface Props {
  reserves: CashReserveResponseDTO[];
}

export default function BranchBreakdown({ reserves }: Props) {
  const sorted = [...reserves].sort(
    (a, b) => b.currentBalance - a.currentBalance,
  );
  const maxAbs = Math.max(
    ...sorted.map((r) => Math.abs(r.currentBalance)),
    1,
  );

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Saldo por Sucursal
      </h3>
      <div className="space-y-3">
        {sorted.map((r) => {
          const isPositive = r.currentBalance >= 0;
          const barWidth = (Math.abs(r.currentBalance) / maxAbs) * 100;
          return (
            <div key={r.id} className="flex items-center gap-3">
              <div className="w-40 truncate text-sm font-medium text-slate-300">
                {r.branchName}
              </div>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-slate-700">
                <div
                  className={`absolute top-0 h-full rounded ${
                    isPositive ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div
                className={`w-28 text-right text-sm font-semibold ${
                  isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                ${r.currentBalance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
