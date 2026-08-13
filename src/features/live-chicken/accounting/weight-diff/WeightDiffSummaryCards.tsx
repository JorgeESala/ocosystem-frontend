import { formatMXN } from "@/utils/moneyNumbers";
import type { WeeklyWeightDiffRow } from "./types";

interface Props {
  rows: WeeklyWeightDiffRow[];
}

const formatKg = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(n);

const formatPct = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(n);

export const WeightDiffSummaryCards = ({ rows }: Props) => {
  const totals = rows.reduce(
    (acc, r) => ({
      declared: acc.declared + (r.totalDeclaredWeight ?? 0),
      real: acc.real + (r.totalRealWeight ?? 0),
      diff: acc.diff + (r.weightDiff ?? 0),
      monetary: acc.monetary + (r.monetaryDiff ?? 0),
      count: acc.count + (r.batchCount ?? 0),
    }),
    { declared: 0, real: 0, diff: 0, monetary: 0, count: 0 },
  );

  const bySupplier = new Map<
    number,
    { name: string; diff: number; monetary: number; declared: number }
  >();
  for (const r of rows) {
    if (r.supplierId == null) continue;
    const prev = bySupplier.get(r.supplierId) ?? {
      name: r.supplierName ?? "—",
      diff: 0,
      monetary: 0,
      declared: 0,
    };
    prev.diff += r.weightDiff ?? 0;
    prev.monetary += r.monetaryDiff ?? 0;
    prev.declared += r.totalDeclaredWeight ?? 0;
    bySupplier.set(r.supplierId, prev);
  }

  let topSupplier: { name: string; diff: number; monetary: number } | null =
    null;
  for (const v of bySupplier.values()) {
    if (!topSupplier || v.diff > topSupplier.diff) {
      topSupplier = v;
    }
  }

  const weightedPct =
    totals.declared > 0 ? (totals.diff / totals.declared) * 100 : 0;

  const diffColor =
    totals.diff > 0.5
      ? "text-red-400"
      : totals.diff < -0.5
        ? "text-green-400"
        : "text-white";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 shadow-sm">
        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Diferencia total
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${diffColor}`}>
            {formatKg(totals.diff)}
          </span>
          <span className="text-sm text-gray-400">kg</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-500 italic">
          Sobre {totals.count} remesas.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 shadow-sm">
        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Diferencia $
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${diffColor}`}>
            {formatMXN(totals.monetary)}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-gray-500 italic">
          Lo que se pagó de más vs. lo recibido.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 shadow-sm">
        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Diferencia %
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${diffColor}`}>
            {formatPct(weightedPct)}%
          </span>
        </div>
        <p className="mt-1 text-[10px] text-gray-500 italic">
          Promedio ponderado por kg declarado.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 shadow-sm">
        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Proveedor con mayor merma
        </p>
        <div className="mt-2 flex flex-col gap-1">
          {topSupplier ? (
            <>
              <span className="truncate text-lg font-bold text-white">
                {topSupplier.name}
              </span>
              <span className={`text-sm font-semibold ${diffColor}`}>
                {formatKg(topSupplier.diff)} kg ·{" "}
                {formatMXN(topSupplier.monetary)}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      </div>
    </div>
  );
};
