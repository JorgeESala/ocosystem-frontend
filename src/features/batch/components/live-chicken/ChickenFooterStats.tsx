import { HiInformationCircle } from "react-icons/hi";
import { StatItem } from "../common/StatItem";
import { formatMXN } from "@/utils/moneyNumbers";
import type { BatchResponseDTO } from "../../types.batch";

const AuditStatWithTooltip: React.FC<{
  label: string;
  value: string;
  className?: string;
  tooltipTitle: string;
  tooltipDesc: React.ReactNode;
}> = ({ label, value, className, tooltipTitle, tooltipDesc }) => (
  <div className="group relative flex cursor-help flex-col border-r border-gray-700 pr-4 last:border-r-0">
    <div className="flex items-center gap-1">
      <span className="text-[10px] tracking-wider text-gray-500 uppercase">
        {label}
      </span>
      <HiInformationCircle className="text-[11px] text-gray-600 transition-colors group-hover:text-blue-400" />
    </div>
    <span className={`font-medium ${className || "text-white"}`}>{value}</span>

    {/* Contenedor del Tooltip Flotante */}
    <div className="absolute bottom-full left-0 z-50 mb-2 hidden w-80 rounded-lg border border-gray-800 bg-gray-950 p-3 text-[11px] leading-relaxed font-normal text-gray-300 shadow-xl group-hover:block">
      <p className="mb-1 border-b border-gray-800 pb-1 font-semibold text-white">
        {tooltipTitle}
      </p>
      <div className="space-y-1.5">{tooltipDesc}</div>
    </div>
  </div>
);

export const ChickenFooterStats: React.FC<{ batch: BatchResponseDTO }> = ({
  batch,
}) => {
  const initialAves = Number(batch.initialQuantity || 0);
  const soldAves = Number(batch.soldQuantity || 0);
  const adjustedAves = Number(batch.adjustedQuantity || 0);

  const weightReal = Number(batch.weightReal || 0);
  const weightSold = Number(batch.weightSold || 0);
  const weightAdjusted = Number(batch.weightAdjusted || 0);

  const totalSales = Number(batch.totalSalesAmount || 0);
  const totalCost = Number(batch.totalAmount || 0);

  // 1. Promedios base para rendimiento
  const avgWeightArrival = initialAves > 0 ? weightReal / initialAves : 0;
  const avgWeightSold = soldAves > 0 ? weightSold / soldAves : 0;

  // 2. NUEVO: Precio promedio de venta real obtenido por Kg ($/KG)
  const avgSalePricePerKg = weightSold > 0 ? totalSales / weightSold : 0;

  // 3. Rendimiento Proporcional de Kilos (Fórmula Proporcional)
  const weightGainPerPollo = avgWeightSold - avgWeightArrival;
  const proportionalWeightDiff = weightGainPerPollo * soldAves;

  // 4. Utilidad Proporcional en base al costo por kg
  const costPerKg = weightReal > 0 ? totalCost / weightReal : 0;
  const kgOut = weightSold + weightAdjusted;
  const proportionalCost = kgOut * costPerKg;
  const realProfit = totalSales - proportionalCost;
  return (
    <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900/50 p-5 text-xs font-medium text-gray-300">
      <div className="flex flex-col items-stretch justify-between gap-6 md:flex-row">
        {/* BLOQUE IZQUIERDO: Estructurado en un Grid Limpio de 2 Filas */}
        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
          {/* FILA 1: Flujo Operativo y Comercial de Ventas */}
          <StatItem label="Aves Vendidas" value={`${soldAves} pzs`} />
          <StatItem
            label="Total Kg Vendidos"
            value={`${weightSold.toFixed(2)} kg`}
          />
          <StatItem
            label="Total Ventas ($)"
            value={formatMXN(totalSales)}
            className="font-semibold text-green-400"
          />
          <StatItem
            label="Precio Prom. Venta"
            value={`${formatMXN(avgSalePricePerKg)}/kg`}
            className="text-gray-300"
          />

          {/* FILA 2: Rendimiento Físico, Bajas y Auditoría de Corral */}
          <StatItem
            label="Promedio Kg/Pollo"
            value={`${avgWeightSold.toFixed(3)} kg`}
          />

          <StatItem
            label="Bajas Totales"
            value={`${weightAdjusted.toFixed(2)} kg (${adjustedAves} aves)`}
            className={
              weightAdjusted > 0 ? "font-medium text-red-400" : "text-gray-500"
            }
          />

          <AuditStatWithTooltip
            label="Rendimiento Kilos (Aprox)"
            value={`${proportionalWeightDiff > 0 ? "+" : ""}${proportionalWeightDiff.toFixed(2)} kg`}
            className={
              proportionalWeightDiff > 0
                ? "font-semibold text-green-400"
                : proportionalWeightDiff < 0
                  ? "text-orange-400"
                  : "text-gray-400"
            }
            tooltipTitle="Rendimiento Proporcional de Kilos"
            tooltipDesc={
              <>
                <p>
                  Muestra un aproximado de kilos ganados en corral basándose en
                  el promedio de peso actual. Al vender el 100%, se convierte en
                  el dato real definitivo.
                </p>
                <p className="mt-1 font-semibold text-gray-400">Fórmula:</p>
                <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                  (Prom. Vendido - Prom. Recibido) × Aves Vendidas
                </p>
              </>
            }
          />
        </div>

        {/* BLOQUE DERECHO: Ganancia Proporcional Destacada a Alto Alto */}
        <div className="flex min-w-[180px] items-center justify-end border-t border-gray-700 pt-4 text-right md:border-t-0 md:border-l md:pt-0 md:pl-8">
          <div className="group relative cursor-help">
            <div className="flex items-center justify-end gap-1">
              <span className="block text-[10px] tracking-wider text-gray-500 uppercase">
                Ganancia Proporcional
              </span>
              <HiInformationCircle className="text-[11px] text-gray-600 transition-colors group-hover:text-blue-400" />
            </div>
            <span
              className={`mt-1 block text-2xl font-bold tracking-tight ${realProfit >= 0 ? "text-blue-400" : "text-red-500"}`}
            >
              {formatMXN(realProfit)}
            </span>

            {/* Tooltip de la Ganancia */}
            <div className="absolute right-0 bottom-full z-50 mb-2 hidden w-80 rounded-lg border border-gray-800 bg-gray-950 p-3 text-left text-[11px] leading-relaxed font-normal text-gray-300 shadow-xl group-hover:block">
              <p className="mb-1 border-b border-gray-800 pb-1 font-semibold text-white">
                Análisis de Utilidad en Vivo
              </p>
              <p className="mb-1">
                Resta el costo proporcional de los kilos ya despachados al
                dinero total de las ventas para mostrar el rendimiento real al
                vuelo.
              </p>
              <p className="mt-1 font-semibold text-gray-400">Fórmula:</p>
              <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                Total Venta - [Kg Salidos × Costo por Kg]
              </p>
              <p className="mt-1 text-[10px] leading-tight text-gray-500">
                Ej. Real: {formatMXN(totalSales)} - ({kgOut.toFixed(2)} kg ×{" "}
                {formatMXN(costPerKg)}/kg) = {formatMXN(realProfit)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
