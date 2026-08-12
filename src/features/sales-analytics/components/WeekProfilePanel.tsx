import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  buildWeekProfiles,
  computeWeekTotals,
  WEEKDAY_ORDER,
  type WeekProfile,
} from "../utils/weekProfile";
import { BRANCH_COLORS } from "../config/branchColors";
import type { Branch } from "@/features/branches/branch/types";
import type { DailySalesDTO } from "../types";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function WeekTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: unknown; value?: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0 || !label) return null;

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
      <div className="mb-1 text-xs font-semibold text-slate-300">{label}</div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const [branch, week] = String(entry.dataKey).split("|");
          return (
            <div
              key={String(entry.dataKey)}
              className="flex items-center justify-between gap-4 text-[11px]"
            >
              <span className="text-slate-300">
                {branch} ({week})
              </span>
              <span className="font-medium text-slate-200">
                {entry.value ?? "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeekProfilePanel({
  dailySales,
  activeProduct,
  branches,
  selectedBranchIds,
}: {
  dailySales: DailySalesDTO[];
  activeProduct: "chicken" | "eggs";
  branches: Branch[];
  selectedBranchIds: number[];
}) {
  const selectedNames = useMemo(
    () =>
      new Set(
        branches
          .filter((b) => selectedBranchIds.includes(b.id))
          .map((b) => b.name),
      ),
    [branches, selectedBranchIds],
  );

  const getQty = useMemo(
    () =>
      (d: DailySalesDTO): Record<string, number> =>
        activeProduct === "chicken" ? d.chickenByBranch : d.eggsByBranch,
    [activeProduct],
  );

  const profiles = useMemo(
    () =>
      buildWeekProfiles(dailySales, getQty).filter((p) =>
        selectedNames.has(p.branch),
      ),
    [dailySales, getQty, selectedNames],
  );

  const totals = useMemo(
    () =>
      computeWeekTotals(dailySales, getQty).filter((t) =>
        selectedNames.has(t.branch),
      ),
    [dailySales, getQty, selectedNames],
  );

  const profilesByBranch = useMemo(() => {
    const map = new Map<string, WeekProfile[]>();
    for (const p of profiles) {
      const list = map.get(p.branch) ?? [];
      list.push(p);
      map.set(p.branch, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    }
    return map;
  }, [profiles]);

  const lineStyles = useMemo(() => {
    const styles = new Map<string, { color: string; dash?: string }>();
    for (const [branch, list] of profilesByBranch) {
      list.forEach((p, i) => {
        const recency = list.length - 1 - i;
        styles.set(`${branch}|${p.weekLabel}`, {
          color: BRANCH_COLORS[branch] ?? "#999",
          dash:
            recency === 0
              ? undefined
              : recency === 1
                ? "6 4"
                : recency === 2
                  ? "2 3"
                  : "1 2",
        });
      });
    }
    return styles;
  }, [profilesByBranch]);

  const rows = useMemo(() => {
    return WEEKDAY_ORDER.map((weekday, i) => {
      const row: Record<string, string | number | null> = {
        day: WEEKDAY_LABELS[i],
      };
      for (const p of profiles) {
        row[`${p.branch}|${p.weekLabel}`] = p.days[weekday];
      }
      return row;
    });
  }, [profiles]);

  const legendContent = () => (
    <div className="flex flex-col items-center gap-1 pt-2">
      <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-300">
        {Array.from(profilesByBranch.keys()).map((name) => (
          <span key={name} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: BRANCH_COLORS[name] ?? "#999" }}
            />
            {name}
          </span>
        ))}
      </div>
      <span className="text-[10px] text-slate-500">
        línea sólida = semana actual · punteada = anteriores
      </span>
    </div>
  );

  if (dailySales.length === 0) {
    return (
      <div className="rounded-xl bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white">
          Comparación semanal
        </h3>
        <div className="py-10 text-center text-sm text-slate-500">
          Sin datos para el periodo seleccionado
        </div>
      </div>
    );
  }

  if (selectedNames.size === 0) {
    return (
      <div className="rounded-xl bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white">
          Comparación semanal
        </h3>
        <div className="py-10 text-center text-sm text-slate-500">
          Selecciona al menos una sucursal
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-white">Comparación semanal</h3>
      <p className="mb-4 text-xs text-slate-500">
        Cada línea es una semana: la sólida es la actual, las punteadas las
        anteriores. Las tarjetas comparan el mismo tramo de la semana (lun →
        hoy) contra la semana anterior.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {totals.map((t) => (
          <div
            key={t.branch}
            data-testid={`week-total-${t.branch}`}
            className="flex items-center gap-2 rounded-lg bg-slate-700/50 px-3 py-1.5 text-sm"
          >
            <span className="font-medium text-slate-200">{t.branch}</span>
            <span className="font-semibold text-white">
              {activeProduct === "eggs"
                ? t.currentWeek.toLocaleString()
                : t.currentWeek}
            </span>
            {t.currentPartial && (
              <span className="text-xs text-slate-500">(hasta hoy)</span>
            )}
            {t.changePct === null ? (
              <span className="text-xs text-slate-500">—</span>
            ) : (
              <>
                <span
                  className={`text-xs font-semibold ${
                    t.changePct >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {t.changePct >= 0 ? "+" : ""}
                  {t.changePct}% vs misma sem. anterior
                </span>
                <span className="text-xs text-slate-500">
                  (
                  {activeProduct === "eggs"
                    ? t.previousWeek.toLocaleString()
                    : t.previousWeek}
                  )
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {profiles.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          Sin datos para las sucursales seleccionadas
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<WeekTooltip />} />
            <Legend content={legendContent} />
            {profiles.map((p) => {
              const style = lineStyles.get(`${p.branch}|${p.weekLabel}`)!;
              return (
                <Line
                  key={`${p.branch}|${p.weekLabel}`}
                  type="monotone"
                  dataKey={`${p.branch}|${p.weekLabel}`}
                  stroke={style.color}
                  strokeWidth={style.dash ? 1.5 : 2.5}
                  strokeDasharray={style.dash}
                  dot={false}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
