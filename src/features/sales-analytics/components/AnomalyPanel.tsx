import { useMemo, useState } from "react";
import {
  RangeSlider,
  ToggleSwitch,
  Tooltip as FlowbiteTooltip,
} from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
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
  analyzeSalesAnomalies,
  type AnomalySeriesPoint,
} from "../utils/anomalies";
import { BRANCH_COLORS } from "../config/branchColors";
import type { DailySalesDTO } from "../types";

const WEEKDAY_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

const formatDate = (date: string): string =>
  new Date(date + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });

function AnomalyDot({
  cx,
  cy,
  payload,
  dataKey,
  anomalyDirections,
}: {
  cx?: number;
  cy?: number;
  payload?: AnomalySeriesPoint;
  dataKey?: unknown;
  anomalyDirections: Map<string, "spike" | "dip">;
}) {
  if (cx == null || cy == null || payload == null || dataKey == null) {
    return null;
  }
  const direction = anomalyDirections.get(`${String(dataKey)}|${payload.date}`);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={direction ? 6 : 4}
      fill={
        direction === "spike"
          ? "#10b981"
          : direction === "dip"
            ? "#ef4444"
            : "#9CA3AF"
      }
      stroke={direction ? "#ffffff" : undefined}
      strokeWidth={direction ? 1.5 : undefined}
    />
  );
}

export function AnomalyHelpContent() {
  return (
    <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
      <p className="font-semibold text-white">¿Qué significa cada línea?</p>
      <p>
        <span className="font-semibold text-white">Línea sólida</span>: ventas
        reales del día (color = sucursal).
      </p>
      <p>
        <span className="font-semibold text-white">Línea punteada</span>:{" "}
        esperado, la mediana del mismo día de la semana en semanas previas.
      </p>
      <p>
        <span className="font-semibold text-white">Límites tenues</span>: rango
        normal (esperado ± umbral).
      </p>
      <p>
        <span className="font-semibold text-emerald-400">Punto verde</span>:{" "}
        pico, muy por encima de lo esperado.
      </p>
      <p>
        <span className="font-semibold text-red-400">Punto rojo</span>: caída,
        muy por debajo de lo esperado.
      </p>
      <div className="border-t border-gray-600 pt-1.5">
        <p className="text-[10px] font-medium tracking-wider text-gray-300 uppercase">
          ¿Cómo se calcula el esperado?
        </p>
        <p>
          Es la mediana de las ventas del mismo día de la semana en el periodo
          (p. ej., los sábados anteriores), sin contar el día actual.
        </p>
        <p>
          Se necesitan al menos 3 días con datos; con menos, el día no se
          evalúa. Los días sin reporte no se cuentan.
        </p>
      </div>
    </div>
  );
}

function AnomalyHelp() {
  return (
    <FlowbiteTooltip
      content={<AnomalyHelpContent />}
      placement="right"
      style="dark"
      arrow
    >
      <HiInformationCircle
        className="cursor-help text-gray-400 hover:text-gray-200"
        size={14}
        aria-label="¿Qué significa cada línea?"
        role="img"
      />
    </FlowbiteTooltip>
  );
}

export function AnomalyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: unknown;
    value?: number;
    payload?: AnomalySeriesPoint;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0 || !label) return null;

  const firstDate = payload[0]?.payload?.date;
  const weekday =
    firstDate != null ? new Date(firstDate + "T00:00:00").getDay() : null;

  const rows = payload
    .map((entry) => {
      const branch = String(entry.dataKey);
      if (
        branch.endsWith(".exp") ||
        branch.endsWith(".hi") ||
        branch.endsWith(".lo")
      ) {
        return null;
      }
      const row = entry.payload;
      const rawExpected = row?.[`${branch}.exp`];
      const actual = entry.value;
      if (rawExpected == null || actual == null) return null;
      const expected = Number(rawExpected);
      if (!Number.isFinite(expected)) return null;
      const dev = Math.round(((actual - expected) / expected) * 1000) / 10;
      return { branch, actual, expected, dev };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
      <div className="mb-1 text-xs font-semibold text-slate-300">
        {weekday != null ? `${WEEKDAY_SHORT[weekday]} ` : ""}
        {label}
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div
            key={r.branch}
            className="flex items-center justify-between gap-4 text-[11px]"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: BRANCH_COLORS[r.branch] ?? "#999",
                }}
              />
              <span className="text-slate-300">{r.branch}</span>
            </span>
            <span className="text-right">
              <span className="font-medium text-slate-200">{r.actual}</span>
              <span className="ml-1 text-slate-500">
                (esp. {Math.round(r.expected)})
              </span>{" "}
              <span
                className={`ml-1 font-semibold ${
                  r.dev >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {r.dev >= 0 ? "+" : ""}
                {r.dev}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnomalyPanel({
  dailySales,
  activeProduct,
}: {
  dailySales: DailySalesDTO[];
  activeProduct: "chicken" | "eggs";
}) {
  const [thresholdPct, setThresholdPct] = useState(30);
  const [showDetails, setShowDetails] = useState(true);
  const unitLabel = activeProduct === "eggs" ? "casilleros" : "pollos";

  const { anomalies, series, analyzedDays } = useMemo(
    () =>
      analyzeSalesAnomalies(
        dailySales,
        (d) =>
          activeProduct === "chicken" ? d.chickenByBranch : d.eggsByBranch,
        { thresholdPct },
      ),
    [dailySales, activeProduct, thresholdPct],
  );

  const branchNames = useMemo(() => {
    const names = new Set<string>();
    for (const point of series) {
      for (const key of Object.keys(point)) {
        if (
          key === "date" ||
          key === "label" ||
          key.endsWith(".exp") ||
          key.endsWith(".hi") ||
          key.endsWith(".lo")
        ) {
          continue;
        }
        names.add(key);
      }
    }
    return Array.from(names);
  }, [series]);

  const anomalyDirections = useMemo(
    () => new Map(anomalies.map((a) => [`${a.branch}|${a.date}`, a.direction])),
    [anomalies],
  );

  const legendContent = () => (
    <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs text-slate-300">
      {branchNames.map((name) => (
        <span key={name} className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: BRANCH_COLORS[name] ?? "#999" }}
          />
          {name}
        </span>
      ))}
    </div>
  );

  if (dailySales.length === 0 || analyzedDays === 0) {
    return (
      <div className="rounded-xl bg-slate-800 p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              Anomalías de ventas
            </h3>
            <AnomalyHelp />
          </div>
          <p className="text-xs text-slate-500">
            Desviación vs. el mismo día de la semana (mediana de semanas
            previas)
          </p>
        </div>
        <div className="py-10 text-center text-sm text-slate-500">
          {dailySales.length === 0
            ? "Sin anomalías en el periodo"
            : "Historial insuficiente para detectar anomalías"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              Anomalías de ventas
            </h3>
            <AnomalyHelp />
          </div>
          <p className="text-xs text-slate-500">
            Desviación vs. el mismo día de la semana (mediana de semanas
            previas)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={showDetails}
            onChange={setShowDetails}
            label="Mostrar esperado y banda"
            sizing="sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Umbral</span>
            <RangeSlider
              aria-label="Umbral de anomalía"
              min={10}
              max={50}
              step={5}
              value={thresholdPct}
              onChange={(e) => setThresholdPct(Number(e.target.value))}
              className="w-32"
              sizing="sm"
            />
            <span className="text-sm font-semibold text-white">
              {thresholdPct}%
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={series}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            label={{
              value: unitLabel,
              angle: -90,
              position: "insideLeft",
              style: { fill: "#9CA3AF", fontSize: 11 },
            }}
          />
          <Tooltip content={<AnomalyTooltip />} />
          <Legend content={legendContent} />
          {showDetails &&
            branchNames.map((name) => {
              const color = BRANCH_COLORS[name] ?? "#999";
              return (
                <Line
                  key={`${name}.hi`}
                  type="monotone"
                  dataKey={`${name}.hi`}
                  stroke={color}
                  strokeOpacity={0.35}
                  strokeWidth={1.25}
                  strokeDasharray="4 3"
                  dot={false}
                />
              );
            })}
          {showDetails &&
            branchNames.map((name) => {
              const color = BRANCH_COLORS[name] ?? "#999";
              return (
                <Line
                  key={`${name}.lo`}
                  type="monotone"
                  dataKey={`${name}.lo`}
                  stroke={color}
                  strokeOpacity={0.35}
                  strokeWidth={1.25}
                  strokeDasharray="4 3"
                  dot={false}
                />
              );
            })}
          {showDetails &&
            branchNames.map((name) => {
              const color = BRANCH_COLORS[name] ?? "#999";
              return (
                <Line
                  key={`${name}.exp`}
                  type="monotone"
                  dataKey={`${name}.exp`}
                  stroke={color}
                  strokeOpacity={0.65}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                />
              );
            })}
          {branchNames.map((name) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={BRANCH_COLORS[name] ?? "#999"}
              strokeWidth={2}
              dot={
                showDetails
                  ? (props) => (
                      <AnomalyDot
                        {...props}
                        anomalyDirections={anomalyDirections}
                      />
                    )
                  : false
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {anomalies.length === 0 ? (
        <div className="py-2 text-center text-sm text-emerald-400">
          Sin anomalías en el periodo
        </div>
      ) : (
        <div className="mb-4">
          <div className="mb-1 text-xs font-medium text-slate-400">
            {anomalies.length}{" "}
            {anomalies.length === 1 ? "anomalía" : "anomalías"}
          </div>
          <div
            data-testid="anomaly-list"
            className="max-h-72 space-y-1 overflow-y-auto pr-1"
          >
            {anomalies.map((a) => (
              <div
                key={`${a.branch}-${a.date}`}
                data-testid={`anomaly-${a.branch}`}
                className="flex flex-wrap items-baseline gap-1 rounded bg-slate-700/40 px-3 py-1.5 text-sm"
              >
                <span className="font-medium text-slate-200">{a.branch}</span>
                <span className="text-xs text-slate-500">
                  · {WEEKDAY_SHORT[a.weekday]} {formatDate(a.date)}
                </span>
                <span
                  className={`font-semibold ${
                    a.direction === "spike"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {a.deviationPct > 0 ? "+" : ""}
                  {a.deviationPct}%
                </span>
                <span className="text-xs text-slate-500">
                  (esperado {Math.round(a.expected)} → real {a.actual})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
