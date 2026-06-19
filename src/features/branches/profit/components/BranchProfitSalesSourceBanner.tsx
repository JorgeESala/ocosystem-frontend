import { useState } from "react";
import { Spinner } from "flowbite-react";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";

export interface BranchChickenComparison {
  branchId: number;
  branchName: string;
  importedChicken: number;
  manualChicken: number;
}

interface Props {
  byBranch: BranchChickenComparison[];
  isLoading: boolean;
  isError: boolean;
}

const DIFF_EPSILON = 0.01;
const SIGNIFICANT_DIFF_RATIO = 0.05;

type Severity = "ok" | "warning" | "danger" | "info";

const colorClasses: Record<Severity, string> = {
  ok: "border-emerald-900/60 bg-emerald-950/40 text-emerald-100",
  warning: "border-amber-900/60 bg-amber-950/40 text-amber-100",
  danger: "border-rose-900/60 bg-rose-950/40 text-rose-100",
  info: "border-slate-700/80 bg-slate-900/60 text-slate-200",
};

const numberClass: Record<Severity, string> = {
  ok: "text-emerald-300",
  warning: "text-amber-300",
  danger: "text-rose-300",
  info: "text-slate-300",
};

const diffTextClass: Record<Severity, string> = {
  ok: "text-emerald-300",
  warning: "text-amber-300",
  danger: "text-rose-300",
  info: "text-slate-300",
};

const formatSigned = (value: number) => {
  if (Math.abs(value) < DIFF_EPSILON) return formatMXN(0);
  const sign = value > 0 ? "+" : "−";
  return `${sign}${formatMXN(Math.abs(value))}`;
};

const rowSeverity = (
  diff: number,
  chickenBaseline: number,
): Severity => {
  if (Math.abs(diff) < DIFF_EPSILON) return "ok";
  const ratio = chickenBaseline > 0 ? Math.abs(diff) / chickenBaseline : 0;
  return ratio >= SIGNIFICANT_DIFF_RATIO ? "danger" : "warning";
};

export default function BranchProfitSalesSourceBanner({
  byBranch,
  isLoading,
  isError,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const importedTotal = byBranch.reduce(
    (sum, b) => sum + b.importedChicken,
    0,
  );
  const manualTotal = byBranch.reduce((sum, b) => sum + b.manualChicken, 0);
  const chickenTotal = importedTotal + manualTotal;
  const diff = manualTotal - importedTotal;
  const absDiff = Math.abs(diff);
  const isExactMatch = absDiff < DIFF_EPSILON;
  const ratio = chickenTotal > 0 ? absDiff / chickenTotal : 0;

  let severity: Severity = "ok";
  let title = "Las ventas de pollo coinciden entre ambas fuentes";
  let body =
    "El total de Subir reporte es igual al total registrado en Entradas y ventas. No hay diferencias.";

  if (isError) {
    severity = "info";
    title = "No se pudo comparar contra Subir reporte";
    body =
      "No fue posible obtener los totales importados para una o más sucursales. El reporte principal sigue siendo válido.";
  } else if (isLoading) {
    severity = "info";
    title = "Comparando ventas de pollo…";
    body = "Obteniendo totales de Subir reporte por sucursal.";
  } else if (!isExactMatch) {
    if (ratio >= SIGNIFICANT_DIFF_RATIO) {
      severity = "danger";
      title =
        "Diferencia significativa en ventas de pollo entre Subir reporte y Entradas y ventas";
      body =
        "El total de pollo de Entradas y ventas difiere del archivo importado. Revisa qué remesas o ventas fueron modificadas manualmente en Entradas y Ventas.";
    } else {
      severity = "warning";
      title = "Diferencia menor en ventas de pollo";
      body =
        "El total de pollo de Entradas y ventas difiere ligeramente del archivo importado. Puede deberse a ajustes manuales recientes.";
    }
  }

  const Icon =
    severity === "ok"
      ? HiCheckCircle
      : severity === "warning" || severity === "danger"
        ? HiExclamationCircle
        : HiInformationCircle;

  const sortedByBranch = [...byBranch].sort(
    (a, b) => Math.abs(b.manualChicken - b.importedChicken) - Math.abs(a.manualChicken - a.importedChicken),
  );

  const hasAnyData = byBranch.some(
    (b) => b.importedChicken > 0 || b.manualChicken > 0,
  );

  return (
    <section
      className={`rounded-3xl border p-4 shadow-sm ${colorClasses[severity]}`}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              {title}
            </h3>
            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] text-slate-300">
                <Spinner size="xs" /> Actualizando
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-current/80">{body}</p>
          <p className="mt-1 text-[10px] tracking-wider text-slate-500 uppercase">
            Comparación enfocada a la categoría Pollo
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Subir reporte (pollo)
              </p>
              <p className={`mt-1 text-lg font-bold ${numberClass[severity]}`}>
                {formatMXN(importedTotal)}
              </p>
              <p className="text-[10px] text-slate-500">
                Tickets importados en categoría Pollo
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Entradas y ventas (pollo)
              </p>
              <p className={`mt-1 text-lg font-bold ${numberClass[severity]}`}>
                {formatMXN(manualTotal)}
              </p>
              <p className="text-[10px] text-slate-500">
                Remesas de pollo registradas manualmente
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Diferencia
              </p>
              <p className={`mt-1 text-lg font-bold ${diffTextClass[severity]}`}>
                {isExactMatch ? formatMXN(0) : formatSigned(diff)}
              </p>
              <p className="text-[10px] text-slate-500">
                {isExactMatch
                  ? "0.0% del total de pollo"
                  : `${(ratio * 100).toFixed(1)}% del total de pollo`}
              </p>
            </div>
          </div>

          {byBranch.length > 1 && !isError && !isLoading && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-300 uppercase transition-colors hover:text-white"
              >
                {expanded ? (
                  <HiChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <HiChevronRight className="h-3.5 w-3.5" />
                )}
                {expanded ? "Ocultar" : "Ver"} origen de la diferencia por sucursal
              </button>

              {expanded && (
                <div className="mt-2 overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] tracking-wider text-slate-400 uppercase">
                      <tr className="border-b border-slate-800">
                        <th className="px-3 py-2">Sucursal</th>
                        <th className="px-3 py-2 text-right">Subir reporte</th>
                        <th className="px-3 py-2 text-right">
                          Entradas y ventas
                        </th>
                        <th className="px-3 py-2 text-right">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {sortedByBranch.map((row) => {
                        const rowDiff = row.manualChicken - row.importedChicken;
                        const rowSev = rowSeverity(rowDiff, chickenTotal);
                        return (
                          <tr key={row.branchId} className="text-slate-200">
                            <td className="px-3 py-2 font-medium">
                              {row.branchName}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-300">
                              {formatMXN(row.importedChicken)}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-300">
                              {formatMXN(row.manualChicken)}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-semibold ${diffTextClass[rowSev]}`}
                            >
                              {formatSigned(rowDiff)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="px-3 py-2 text-[10px] text-slate-500">
                    Las filas se ordenan por la magnitud de la diferencia para
                    ayudarte a ubicar de dónde viene.
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasAnyData && !isError && !isLoading && (
            <p className="mt-2 text-[11px] text-slate-500">
              No hay datos de pollo (Subir reporte ni Entradas y ventas) para
              las sucursales y el periodo seleccionados.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
