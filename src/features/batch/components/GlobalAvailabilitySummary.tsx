import React from "react";
import { HiArrowUp } from "react-icons/hi";
import { GiFeather } from "react-icons/gi";
import { EggQuantityDisplay } from "./egg/EggQuantityDisplay";
import type { BatchResponseDTO, BusinessUnitType } from "../types.batch";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { ValorEnInventarioHelp } from "./common/ValorEnInventarioHelp";

interface GlobalAvailabilitySummaryProps {
  batches: BatchResponseDTO[];
  unitType: BusinessUnitType;
  onBatchClick: (batchId: number) => void;
}

export const GlobalAvailabilitySummary: React.FC<
  GlobalAvailabilitySummaryProps
> = ({ batches, unitType, onBatchClick }) => {
  const visibleBatches = batches.filter(
    (b) => Number(b.remainingQuantity) > 0,
  );

  const helpUnit: "aves" | "piezas" = unitType === "EGG" ? "piezas" : "aves";
  const valorEnInventarioHelp = React.useMemo(
    () => <ValorEnInventarioHelp unit={helpUnit} />,
    [helpUnit],
  );

  if (visibleBatches.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <p className="text-center text-sm text-gray-400">
          No hay disponibilidad en este periodo.
        </p>
      </div>
    );
  }

  const totalRemainingPieces = visibleBatches.reduce(
    (sum, b) =>
      sum +
      (b.remainingBoxes || 0) * 360 +
      (b.remainingCartons || 0) * 30 +
      (b.remainingPieces || 0),
    0,
  );

  const totalRemaining = visibleBatches.reduce(
    (sum, b) => sum + Number(b.remainingQuantity),
    0,
  );

  const totalValorEnInventario = visibleBatches.reduce<number | null>(
    (acc, b) => {
      const raw = b.availableCost;
      if (raw === null || raw === undefined) return acc;
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) return acc;
      if (acc === null) return n;
      return acc + n;
    },
    null,
  );

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">
            Disponibilidad Global
          </h3>
          <span className="flex items-center gap-2 rounded-full bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-300">
            {unitType === "EGG" ? (
              <EggQuantityDisplay totalPieces={totalRemainingPieces} className="text-xs" />
            ) : (
              <>{totalRemaining}</>
            )}{" "}
            en {visibleBatches.length} remesa
            {visibleBatches.length > 1 ? "s" : ""}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium tracking-wider text-emerald-300 uppercase">
              Valor en inventario
            </span>
            {valorEnInventarioHelp}
          </div>
          <p className="text-xl font-bold text-white">
            {totalValorEnInventario !== null
              ? formatMXN(totalValorEnInventario)
              : "—"}
          </p>
          <p className="text-[10px] text-gray-400">
            MXN restantes en remesas
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {visibleBatches.map((batch) => (
          <div
            key={batch.id}
            className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-gray-700/50"
          >
            <div className="flex items-center gap-3">
              {unitType === "LIVE_CHICKEN" && (
                <GiFeather size={14} className="text-orange-400" />
              )}
              {unitType === "EGG" && (
                <EggQuantityDisplay
                  totalPieces={
                    (batch.remainingBoxes || 0) * 360 +
                    (batch.remainingCartons || 0) * 30 +
                    (batch.remainingPieces || 0)
                  }
                  className="text-sm"
                />
              )}
              {unitType !== "LIVE_CHICKEN" && unitType !== "EGG" && (
                <span className="text-sm text-gray-300">
                  {batch.remainingQuantity}
                </span>
              )}
              {unitType === "LIVE_CHICKEN" && (
                <span className="text-sm text-gray-300">
                  {batch.remainingQuantity} aves
                </span>
              )}
              <span className="text-xs text-gray-500">
                de Remesa #{batch.id}
              </span>
              <span className="text-[10px] text-gray-600">
                {formatHumanDate(batch.entryDate)}
              </span>
            </div>

            <button
              onClick={() => onBatchClick(batch.id)}
              className="flex items-center gap-1 rounded-md bg-gray-700/50 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-blue-600 hover:text-white"
            >
              <span>Ir</span>
              <HiArrowUp size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
