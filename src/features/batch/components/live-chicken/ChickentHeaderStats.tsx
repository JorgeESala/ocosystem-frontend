import type { BatchResponseDTO } from "../../types.batch";
import React from "react";
import { StatItem } from "../common/StatItem";
import { formatMXN } from "@/utils/moneyNumbers";

export const ChickenHeaderStats: React.FC<{ batch: BatchResponseDTO }> = ({
  batch,
}) => {
  const initialAves = Number(batch.initialQuantity || 0);
  const remainingAves = Number(batch.remainingQuantity || 0);

  const weightDeclared = Number(batch.metadata?.declared_weight || 0);
  const weightReal = Number(batch.weightReal || 0);
  const weightDiffArrival = weightReal - weightDeclared;

  const totalCost = Number(batch.totalAmount || 0);
  const priceProvider = weightDeclared > 0 ? totalCost / weightDeclared : 0;

  const priceReal = weightReal > 0 ? totalCost / weightReal : 0;
  const moneyDiffArrival = weightDiffArrival * priceProvider;

  return (
    <div className="mt-2 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 border-b border-gray-700/30 pb-3 sm:grid-cols-3 md:grid-cols-5">
        <StatItem label="Aves Iniciales" value={`${initialAves} und.`} />
        <StatItem
          label="Peso Declarado"
          value={`${weightDeclared.toFixed(2)} kg`}
        />
        <StatItem label="Peso Real" value={`${weightReal.toFixed(2)} kg`} />
        <StatItem
          label="Disponible"
          value={`${remainingAves} aves`}
          className="font-bold text-yellow-400"
        />
        <StatItem
          label="Dif. Kilos (Viaje)"
          value={`${weightDiffArrival > 0 ? "+" : ""}${weightDiffArrival.toFixed(2)} kg`}
          className={
            weightDiffArrival < 0
              ? "font-semibold text-red-400"
              : "text-green-400"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatItem
          label="Costo Remesa"
          value={formatMXN(totalCost)}
          className="font-semibold text-white"
        />
        <StatItem
          label="Precio Proveedor"
          value={`${formatMXN(priceProvider)}/kg`}
        />
        <StatItem
          label="Precio Real / Kg"
          value={`${formatMXN(priceReal)}/kg`}
          className="text-blue-400"
        />
        <StatItem
          label="Merma en Dinero"
          value={formatMXN(moneyDiffArrival)}
          className={moneyDiffArrival < 0 ? "text-red-400" : "text-gray-400"}
        />
      </div>
    </div>
  );
};
