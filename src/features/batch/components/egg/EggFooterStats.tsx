import type { BatchResponseDTO } from "../../types.batch";
import { StatItem } from "../common/StatItem";
import { formatMXN } from "@/utils/moneyNumbers";
import { EggQuantityDisplay } from "./EggQuantityDisplay";
import { HiInformationCircle } from "react-icons/hi";
const AuditStatWithTooltip: React.FC<{
  label: string;
  value: React.ReactNode;
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

export const EggFooterStats: React.FC<{ batch: BatchResponseDTO }> = ({
  batch,
}) => {
  const initialPieces = Number(batch.initialQuantity || 0);
  const soldPieces = Number(batch.soldQuantity || 0);
  const adjustedPieces = Number(batch.adjustedQuantity || 0);
  const totalSales = Number(batch.totalSalesAmount || 0);
  const totalCost = Number(batch.totalAmount || 0);

  // 1. DETECCIÓN DE ANOMALÍAS: % de Rotura/Merma sobre el inventario
  const breakageIndex =
    initialPieces > 0 ? (adjustedPieces / initialPieces) * 100 : 0;

  // 2. RENDIMIENTO: Precio promedio real obtenido por cada pieza individual vendida
  const avgSalePricePerPiece = soldPieces > 0 ? totalSales / soldPieces : 0;

  // 3. CÁLCULO PROPORCIONAL DE COSTO Y GANANCIA (Evita los negativos falsos)
  // Calculamos cuánto nos costó cada pieza individual al comprarla
  const costPerPiece = initialPieces > 0 ? totalCost / initialPieces : 0;

  // El costo de lo que ya salió de bodega (Vendido + Roto)
  const piecesOut = soldPieces + adjustedPieces;
  const proportionalCost = piecesOut * costPerPiece;

  // Utilidad real en base a lo que se ha desplazado al momento
  const realProfit = totalSales - proportionalCost;

  return (
    <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900/50 p-5 text-xs font-medium text-gray-300">
      <div className="flex flex-col items-stretch justify-between gap-6 md:flex-row">
        {/* BLOQUE IZQUIERDO: Estructura Grid responsiva de 2 filas */}
        <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Fila 1: Cantidades y totales de Dinero */}
          <StatItem
            label="Total Vendido"
            value={<EggQuantityDisplay totalPieces={soldPieces} />}
          />

          <StatItem
            label="Total Ventas ($)"
            value={formatMXN(totalSales)}
            className="font-semibold text-green-400"
          />

          <StatItem
            label="Precio Prom. Venta"
            value={`${formatMXN(avgSalePricePerPiece)} /pz`}
            className="text-gray-300"
          />

          {/* Fila 2: Control de Mermas y Alertas */}
          <StatItem
            label="Total Bajas (Mermas)"
            value={<EggQuantityDisplay totalPieces={adjustedPieces} />}
          />

          {/* KPI de Auditoría Operativa con Tooltip */}
          <AuditStatWithTooltip
            label="Índice de Rotura"
            value={`${breakageIndex.toFixed(2)}%`}
            className={
              breakageIndex > 1.5
                ? "font-semibold text-red-400"
                : "text-gray-400"
            }
            tooltipTitle="Control de Roturas en Almacén"
            tooltipDesc={
              <>
                <p>
                  Porcentaje de piezas que se han dado de baja por daño o rotura
                  respecto al inventario inicial. Si supera el 1.5%, indica un
                  problema de manejo en bodega.
                </p>
                <p className="mt-1 font-semibold text-gray-400">Fórmula:</p>
                <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                  (Piezas de Baja / Piezas Iniciales) × 100
                </p>
                <p className="mt-1 text-[10px] leading-tight text-gray-500">
                  Ej. Actual: ({adjustedPieces} pzs / {initialPieces} pzs) × 100
                  = {breakageIndex.toFixed(2)}%.
                </p>
              </>
            }
          />
        </div>

        {/* BLOQUE DERECHO: Utilidad Proporcional en Vivo (Mismo diseño de alto impacto que el pollo) */}
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

            {/* Tooltip de la Utilidad de Huevo */}
            <div className="absolute right-0 bottom-full z-50 mb-2 hidden w-80 rounded-lg border border-gray-800 bg-gray-950 p-3 text-left text-[11px] leading-relaxed font-normal text-gray-300 shadow-xl group-hover:block">
              <p className="mb-1 border-b border-gray-800 pb-1 font-semibold text-white">
                Análisis de Utilidad en Vivo
              </p>
              <p className="mb-1">
                Resta el costo proporcional de las piezas ya despachadas (tanto
                vendidas como rotas) al dinero total cobrado.
              </p>
              <p className="mt-1 font-semibold text-gray-400">Fórmula:</p>
              <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                Total Venta - [(Piezas Vendidas + Bajas) × Costo/Pz]
              </p>
              <p className="mt-1 text-[10px] leading-tight text-gray-500">
                Ej. Actual: {formatMXN(totalSales)} - ({piecesOut} pzs ×{" "}
                {formatMXN(costPerPiece)}/pz) = {formatMXN(realProfit)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
