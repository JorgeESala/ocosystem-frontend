import React from "react";
import { HiInformationCircle } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";

interface CardWithTooltipProps {
  label: string;
  value: string;
  className?: string;
  borderClass: string;
  bgClass: string;
  labelClass: string;
  tooltipTitle: string;
  tooltipDesc: React.ReactNode;
}

const CardWithTooltip: React.FC<CardWithTooltipProps> = ({
  label,
  value,
  className,
  borderClass,
  bgClass,
  labelClass,
  tooltipTitle,
  tooltipDesc,
}) => (
  <div
    className={`group relative rounded-lg border p-3 text-center ${borderClass} ${bgClass}`}
  >
    <div className="flex items-center justify-center gap-1">
      <p className={`text-[10px] uppercase tracking-wider ${labelClass}`}>
        {label}
      </p>
      <HiInformationCircle className="text-[11px] text-gray-500 transition-colors group-hover:text-blue-400" />
    </div>
    <p className={`mt-1 text-lg font-bold ${className}`}>{value}</p>

    <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden w-80 -translate-x-1/2 rounded-lg border border-gray-800 bg-gray-950 p-3 text-left text-[11px] leading-relaxed font-normal text-gray-300 shadow-xl group-hover:block">
      <p className="mb-1 border-b border-gray-800 pb-1 font-semibold text-white">
        {tooltipTitle}
      </p>
      <div className="space-y-1.5">{tooltipDesc}</div>
    </div>
  </div>
);

interface Props {
  totalSales: number;
  totalChickenCostsProRated: number;
  totalExpenses: number;
  profit: number;
}

export const ProfitSummaryCards: React.FC<Props> = ({
  totalSales,
  totalChickenCostsProRated,
  totalExpenses,
  profit,
}) => {
  const profitColor = profit >= 0 ? "text-emerald-300" : "text-rose-300";
  const profitBorder = profit >= 0 ? "border-emerald-800" : "border-rose-800";
  const profitBg = profit >= 0 ? "bg-emerald-900/50" : "bg-rose-900/50";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <CardWithTooltip
        label="Ventas Totales"
        value={formatMXN(totalSales)}
        className="text-green-300"
        borderClass="border-green-800"
        bgClass="bg-green-900/50"
        labelClass="text-green-400"
        tooltipTitle="Ventas totales del periodo"
        tooltipDesc={
          <p>
            Suma de las ventas de cada remesa dentro del rango de fechas
            seleccionado. Incluye ventas a sucursales y clientes externos.
          </p>
        }
      />

      <CardWithTooltip
        label="Costos Proporcionales"
        value={formatMXN(totalChickenCostsProRated)}
        className="text-orange-300"
        borderClass="border-orange-800"
        bgClass="bg-orange-900/50"
        labelClass="text-orange-400"
        tooltipTitle="Costo proporcional"
        tooltipDesc={
          <>
            <p>
              Suma del costo proporcional de cada remesa para las unidades
              vendidas dentro del rango. El backend reparte el costo total de
              la remesa entre las unidades vendidas según el costo por
              pieza/ave.
            </p>
            <p className="mt-1 font-semibold text-gray-400">
              Fórmula (por remesa):
            </p>
            <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
              costoPorUnidad × unidadesVendidasEnRango
            </p>
            <p className="mt-1 font-semibold text-gray-400">Total del rango:</p>
            <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
              {formatMXN(totalChickenCostsProRated)}
            </p>
          </>
        }
      />

      <CardWithTooltip
        label="Gastos"
        value={formatMXN(totalExpenses)}
        className="text-yellow-300"
        borderClass="border-yellow-800"
        bgClass="bg-yellow-900/50"
        labelClass="text-yellow-400"
        tooltipTitle="Gastos operativos"
        tooltipDesc={
          <p>
            Suma de todos los gastos operativos registrados para la unidad de
            negocio activa (Pollo vivo o Huevo) con fecha dentro del rango
            seleccionado. No incluye el costo de las remesas.
          </p>
        }
      />

      <CardWithTooltip
        label="Ganancia Neta"
        value={formatMXN(profit)}
        className={profitColor}
        borderClass={profitBorder}
        bgClass={profitBg}
        labelClass="text-blue-400"
        tooltipTitle="Ganancia neta del periodo"
        tooltipDesc={
          <>
            <p>
              Ganancia después de descontar los costos de remesas y los gastos
              operativos. Se pinta verde si es positiva y roja si es negativa.
            </p>
            <p className="mt-1 font-semibold text-gray-400">Fórmula:</p>
            <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
              Ventas totales - Costos proporcionales - Gastos
            </p>
            <p className="mt-1 font-semibold text-gray-400">Ejemplo real:</p>
            <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
              {formatMXN(totalSales)} - {formatMXN(totalChickenCostsProRated)} - {formatMXN(totalExpenses)} = {formatMXN(profit)}
            </p>
          </>
        }
      />
    </div>
  );
};
