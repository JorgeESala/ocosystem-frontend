import { formatMXN } from "@/utils/moneyNumbers";
import type { BatchResponseDTO } from "../../types.batch";
import { StatItem } from "../common/StatItem";
import { EggQuantityDisplay } from "./EggQuantityDisplay";
import React from "react";
export const EggHeaderStats: React.FC<{ batch: BatchResponseDTO }> = ({
  batch,
}) => {
  const totalCost = Number(batch.totalAmount || 0);
  const initialPieces = Number(batch.initialQuantity || 0);
  const soldPieces = Number(batch.soldQuantity || 0);

  const totalBoxesInitial = initialPieces / 360;
  const costPerBox = totalBoxesInitial > 0 ? totalCost / totalBoxesInitial : 0;

  const costPerPiece = initialPieces > 0 ? totalCost / initialPieces : 0;
  const totalOut = soldPieces + Number(batch.adjustedQuantity || 0);
  const salesProgress =
    initialPieces > 0 ? (totalOut / initialPieces) * 100 : 0;

  return (
    <div className="mt-2 flex flex-col gap-4">
      <div className="grid grid-cols-1 items-end gap-6 border-b border-gray-700/30 pb-3 sm:grid-cols-2">
        <StatItem
          label="Inventario Inicial"
          value={<EggQuantityDisplay totalPieces={initialPieces} />}
        />
        <StatItem
          label="Disponible en Bodega"
          value={
            <EggQuantityDisplay
              totalPieces={Number(batch.remainingQuantity || 0)}
            />
          }
          className="text-yellow-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatItem
          label="Inversión Huevo"
          value={formatMXN(totalCost)}
          className="font-semibold text-white"
        />
        <StatItem
          label="Costo por Caja"
          value={`${formatMXN(costPerBox)} /cj`}
          className="text-blue-400"
        />
        <StatItem
          label="Costo por Pieza"
          value={`${formatMXN(costPerPiece)} /pz`}
          className="text-gray-300"
        />
        <StatItem
          label="Desplazamiento"
          value={`${salesProgress.toFixed(1)}% vendido`}
          className={
            salesProgress === 100
              ? "font-medium text-green-400"
              : "text-gray-400"
          }
        />
      </div>
    </div>
  );
};
