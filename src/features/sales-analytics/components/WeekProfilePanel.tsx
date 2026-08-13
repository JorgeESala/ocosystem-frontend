import { useMemo, useState } from "react";
import { Select, Tooltip as FlowbiteTooltip } from "flowbite-react";
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
  filterDrawableProfiles,
  WEEKDAY_ORDER,
  type WeekProfile,
} from "../utils/weekProfile";
import { BRANCH_COLORS } from "../config/branchColors";
import type { Branch } from "@/features/branches/branch/types";
import type { DailySalesDTO } from "../types";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function WeekChipHelpContent({
  windowDays,
  missingToday,
  missingPrevDays,
}: {
  windowDays: number;
  missingToday: boolean;
  missingPrevDays: number;
}) {
  return (
    <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
      <p>
        Se comparan los días con datos de esta semana contra los mismos días de
        la semana pasada.
      </p>
      <p>
        {windowDays} {windowDays === 1 ? "día comparado" : "días comparados"}
      </p>
      {missingToday && <p>El reporte de hoy aún no se registra.</p>}
      {missingPrevDays > 0 && (
        <p>
          {missingPrevDays === 1
            ? "Falta 1 día de la semana pasada."
            : `Faltan ${missingPrevDays} días de la semana pasada.`}
        </p>
      )}
    </div>
  );
}

const formatDayDate = (weekStart: string, weekdayIndex: number): string => {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + weekdayIndex);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

export function WeekTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: unknown; value?: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0 || !label) return null;

  const weekdayIndex = WEEKDAY_LABELS.indexOf(label);

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
      <div className="mb-1 text-xs font-semibold text-slate-300">{label}</div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const [branch, weekStart] = String(entry.dataKey).split("|");
          const date =
            weekdayIndex >= 0 && weekStart
              ? formatDayDate(weekStart, weekdayIndex)
              : weekStart;
          return (
            <div
              key={String(entry.dataKey)}
              className="flex items-center justify-between gap-4 text-[11px]"
            >
              <span className="text-slate-300">
                {branch} · {date}
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

  const [weeksToShow, setWeeksToShow] = useState(2);

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

  const drawableProfiles = useMemo(
    () => filterDrawableProfiles(profiles, dailySales, weeksToShow),
    [profiles, dailySales, weeksToShow],
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
    for (const p of drawableProfiles) {
      const list = map.get(p.branch) ?? [];
      list.push(p);
      map.set(p.branch, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    }
    return map;
  }, [drawableProfiles]);

  const lineStyles = useMemo(() => {
    const styles = new Map<string, { color: string; dash?: string }>();
    for (const [branch, list] of profilesByBranch) {
      list.forEach((p, i) => {
        const recency = list.length - 1 - i;
        styles.set(`${branch}|${p.weekStart}`, {
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
      for (const p of drawableProfiles) {
        row[`${p.branch}|${p.weekStart}`] = p.days[weekday];
      }
      return row;
    });
  }, [drawableProfiles]);

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
        línea sólida = semana actual · punteada = la semana pasada
      </span>
    </div>
  );

  if (dailySales.length === 0) {
    return (
      <div className="rounded-xl bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white">
          ¿Cómo va la semana?
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
          ¿Cómo va la semana?
        </h3>
        <div className="py-10 text-center text-sm text-slate-500">
          Selecciona al menos una sucursal
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            ¿Cómo va la semana?
          </h3>
          <p className="text-xs text-slate-500">
            Compara lo vendido hasta hoy contra los mismos días de la semana
            pasada. Los días sin reporte no se cuentan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Semanas a mostrar</span>
          <Select
            aria-label="Semanas a mostrar"
            value={weeksToShow}
            onChange={(e) => setWeeksToShow(Number(e.target.value))}
            className="min-w-24"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </Select>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {totals.map((t) => (
          <FlowbiteTooltip
            key={t.branch}
            content={
              <WeekChipHelpContent
                windowDays={t.windowDays}
                missingToday={t.missingToday}
                missingPrevDays={t.missingPrevDays}
              />
            }
            placement="top"
            style="dark"
            arrow
          >
            <div
              data-testid={`week-total-${t.branch}`}
              className="flex cursor-help items-center gap-2 rounded-lg bg-slate-700/50 px-3 py-1.5 text-sm"
            >
              <span className="font-medium text-slate-200">{t.branch}</span>
              <span className="font-semibold text-white">
                {activeProduct === "eggs"
                  ? t.currentWeek.toLocaleString()
                  : t.currentWeek}
              </span>
              {t.currentPartial && (
                <span className="text-xs text-slate-500">
                  {t.missingToday ? "(hoy sin reporte)" : "(hasta hoy)"}
                </span>
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
                    {t.changePct}% vs la semana pasada
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
          </FlowbiteTooltip>
        ))}
      </div>

      {drawableProfiles.length === 0 ? (
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
            {drawableProfiles.map((p) => {
              const style = lineStyles.get(`${p.branch}|${p.weekStart}`)!;
              return (
                <Line
                  key={`${p.branch}|${p.weekStart}`}
                  type="monotone"
                  dataKey={`${p.branch}|${p.weekStart}`}
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
