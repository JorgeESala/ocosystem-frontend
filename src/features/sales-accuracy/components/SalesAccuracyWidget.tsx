import { useMemo, useState } from "react";
import { Spinner, Tooltip } from "flowbite-react";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiXCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { useMonthlyAccuracy } from "../api/salesAccuracy.queries";

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 98) return "text-emerald-400";
  if (accuracy >= 95) return "text-amber-400";
  return "text-red-400";
}

function getAccuracyBg(accuracy: number): string {
  if (accuracy >= 98) return "bg-emerald-400";
  if (accuracy >= 95) return "bg-amber-400";
  return "bg-red-400";
}

function getAccuracyIcon(accuracy: number) {
  if (accuracy >= 98)
    return <HiCheckCircle className="h-4 w-4 text-emerald-400" />;
  if (accuracy >= 95)
    return <HiExclamationCircle className="h-4 w-4 text-amber-400" />;
  return <HiXCircle className="h-4 w-4 text-red-400" />;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SalesAccuracyWidget() {
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const { data: accuracyData = [], isLoading } =
    useMonthlyAccuracy(currentMonth);

  const monthLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-slate-800 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Precisión de Ventas
          </h3>
          <Spinner size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">
            Precisión de Ventas
          </h3>
          <Tooltip
            content={
              <div className="max-w-xs space-y-1 text-xs">
                <p className="font-semibold">¿Qué significa esta sección?</p>
                <p>
                  Compara las ventas de pollo registradas en el reporte (Subir
                  reporte) con las ventas registradas en Entradas y ventas por
                  el gerente.
                </p>
                <p>
                  Una diferencia indica que el gerente hizo correcciones al
                  registrar las ventas del día.
                </p>
                <div className="mt-1 border-t border-slate-600 pt-1">
                  <p>
                    <span className="text-emerald-400">Verde (≥98%)</span>: Sin
                    correcciones significativas
                  </p>
                  <p>
                    <span className="text-amber-400">Amarillo (95-98%)</span>:
                    Algunas correcciones menores
                  </p>
                  <p>
                    <span className="text-red-400">Rojo (&lt;95%)</span>:
                    Correcciones frecuentes
                  </p>
                </div>
              </div>
            }
            placement="top"
          >
            <button
              type="button"
              className="text-slate-400 hover:text-slate-300"
            >
              <HiInformationCircle className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
        <span className="text-xs text-slate-400 capitalize">{monthLabel}</span>
      </div>

      {accuracyData.length === 0 ? (
        <p className="text-xs text-slate-500">Sin datos este mes</p>
      ) : (
        <div className="space-y-2">
          {accuracyData.map((branch) => (
            <div
              key={branch.branchId}
              className="relative"
              onMouseEnter={() => setHoveredBranch(branch.branchId)}
              onMouseLeave={() => setHoveredBranch(null)}
            >
              <div className="flex cursor-default items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  {getAccuracyIcon(branch.accuracy)}
                  <span className="text-xs text-slate-300">
                    {branch.branchName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">
                    {branch.correctionCount > 0
                      ? `${branch.correctionCount} corrección${branch.correctionCount > 1 ? "es" : ""}`
                      : "Sin correcciones"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-full rounded-full ${getAccuracyBg(branch.accuracy)}`}
                        style={{ width: `${Math.min(branch.accuracy, 100)}%` }}
                      />
                    </div>
                    <span
                      className={`w-10 text-right text-xs font-medium ${getAccuracyColor(branch.accuracy)}`}
                    >
                      {branch.accuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {hoveredBranch === branch.branchId && (
                <div className="absolute top-full right-0 z-20 mt-1 w-64 rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
                  <div className="mb-2 border-b border-slate-600 pb-1.5 text-[10px] text-slate-500">
                    Detalle de comparación
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subir reporte:</span>
                      <span className="font-medium text-slate-200">
                        {formatCurrency(branch.posTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entradas y ventas:</span>
                      <span className="font-medium text-slate-200">
                        {formatCurrency(branch.batchTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-600 pt-1.5">
                      <span className="text-slate-400">Diferencia:</span>
                      <span
                        className={`font-medium ${
                          branch.diffAmount > 0
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {formatCurrency(branch.diffAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Precisión:</span>
                      <span
                        className={`font-medium ${getAccuracyColor(branch.accuracy)}`}
                      >
                        {branch.accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
