import React from "react";
import { HiArrowUp } from "react-icons/hi";
import { GiFeather } from "react-icons/gi";
import { EggQuantityDisplay } from "./egg/EggQuantityDisplay";
import { AvailabilityAuditDrawer } from "./AvailabilityAuditDrawer";
import type { BatchResponseDTO, BusinessUnitType } from "../types.batch";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { usePendingOrderQuantity } from "@/features/route-orders/api/routeOrders.queries";
import { ValorEnInventarioHelp } from "./common/ValorEnInventarioHelp";

interface GlobalAvailabilitySummaryProps {
  batches: BatchResponseDTO[];
  allBatches?: BatchResponseDTO[];
  unitType: BusinessUnitType;
  startDate: string | null;
  endDate: string | null;
  onBatchClick: (batchId: number) => void;
}

export const GlobalAvailabilitySummary: React.FC<
  GlobalAvailabilitySummaryProps
> = ({ batches, allBatches, unitType, startDate, endDate, onBatchClick }) => {
  const [auditOpen, setAuditOpen] = React.useState(false);
  const completeBatches = allBatches ?? batches;
  const visibleBatches = batches.filter((b) => Number(b.remainingQuantity) > 0);
  const supportsOrders = unitType === "EGG" || unitType === "LIVE_CHICKEN";

  const helpUnit: "aves" | "piezas" = unitType === "EGG" ? "piezas" : "aves";
  const valorEnInventarioHelp = React.useMemo(
    () => <ValorEnInventarioHelp unit={helpUnit} />,
    [helpUnit],
  );
  const { data: pendingOrders, isLoading: isPendingOrdersLoading } =
    usePendingOrderQuantity(startDate, endDate, supportsOrders);

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

  const totalRemainingUnits =
    unitType === "EGG" ? totalRemainingPieces : totalRemaining;
  let pendingUnits = Number(pendingOrders?.quantity ?? 0);
  if (unitType === "EGG") {
    pendingUnits *= 30;
  }
  const availableAfterOrders = totalRemainingUnits - pendingUnits;

  const unitsDisplay = (units: number) =>
    unitType === "EGG" ? (
      <EggQuantityDisplay totalPieces={Math.max(0, units)} />
    ) : (
      <span>{units.toLocaleString("es-MX")} aves</span>
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
              <EggQuantityDisplay
                totalPieces={totalRemainingPieces}
                className="text-xs"
              />
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
          <p className="text-[10px] text-gray-400">MXN restantes en remesas</p>
        </div>
      </div>

      {supportsOrders && (
        <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md bg-gray-900/50 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Pedidos pendientes:</span>
            <button
              type="button"
              onClick={() => setAuditOpen(true)}
              data-testid="pending-orders"
              className="font-semibold text-amber-300 underline decoration-dotted underline-offset-2 hover:text-amber-200"
              aria-label="Ver detalle de pedidos pendientes"
            >
              {isPendingOrdersLoading
                ? "Calculando..."
                : pendingOrders
                  ? unitsDisplay(pendingUnits)
                  : "—"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">
              Disponible después de pedidos:
            </span>
            <button
              type="button"
              onClick={() => setAuditOpen(true)}
              data-testid="available-after-orders"
              className={`font-semibold underline decoration-dotted underline-offset-2 ${
                availableAfterOrders < 0
                  ? "text-red-300 hover:text-red-200"
                  : "text-emerald-300 hover:text-emerald-200"
              }`}
              aria-label="Ver detalle de disponibilidad"
            >
              {isPendingOrdersLoading
                ? "Calculando..."
                : unitsDisplay(availableAfterOrders)}
            </button>
            {availableAfterOrders < 0 && (
              <span className="text-[10px] font-semibold tracking-wide text-red-300 uppercase">
                Sobrepedido
              </span>
            )}
            {availableAfterOrders < 0 && unitType === "EGG" && (
              <span className="flex items-center gap-1 text-red-300">
                Faltan
                <EggQuantityDisplay
                  totalPieces={Math.abs(availableAfterOrders)}
                />
              </span>
            )}
          </div>
        </div>
      )}

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

      {supportsOrders && (
        <AvailabilityAuditDrawer
          open={auditOpen}
          onClose={() => setAuditOpen(false)}
          unitType={unitType === "EGG" ? "EGG" : "LIVE_CHICKEN"}
          startDate={startDate}
          endDate={endDate}
          includedBatches={visibleBatches}
          allBatches={completeBatches}
          totalRemainingUnits={totalRemainingUnits}
        />
      )}
    </div>
  );
};
