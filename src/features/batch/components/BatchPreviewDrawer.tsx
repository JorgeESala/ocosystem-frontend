import { Drawer, Spinner, DrawerHeader, DrawerItems, Badge } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useBatchFullDetail } from "../api/batch.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import { HiOutlineExternalLink } from "react-icons/hi";
import { UNIT_CONFIG } from "../config/unitConfig";
import { EggQuantityDisplay } from "./egg/EggQuantityDisplay";
import type { BusinessUnitType, Movement } from "../types.batch";

interface Props {
  open: boolean;
  onClose: () => void;
  batchId: number | null;
  highlightSaleId?: number | null;
  unitType?: BusinessUnitType;
}

export const BatchPreviewDrawer = ({ open, onClose, batchId, highlightSaleId, unitType }: Props) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const highlightRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useBatchFullDetail(batchId ?? 0, {
    enabled: open && batchId != null,
  });

  const batchType = data?.batch?.type ?? unitType;
  const config = batchType ? UNIT_CONFIG[batchType] : null;

  const highlightedMov = highlightSaleId != null
    ? data?.movements.find((m) => m.id === highlightSaleId)
    : null;

  const otherMovements = highlightSaleId != null
    ? data?.movements.filter((m) => m.id !== highlightSaleId) ?? []
    : data?.movements ?? [];

  useEffect(() => {
    if (highlightedMov && highlightRef.current) {
      const timeout = setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [highlightedMov]);

  const handleGoToBatch = () => {
    if (!batchId) return;
    onClose();
    navigate(`/business/${slug}/salesAndBatches?batch=${batchId}`);
  };

  return (
    <Drawer open={open} onClose={onClose} position="right" className="w-[550px]">
      <DrawerHeader title={batchId ? `Remesa #${batchId}` : "Remesa"}>
        {batchId && (
          <button
            onClick={handleGoToBatch}
            className="mt-2 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
          >
            Ver remesa completa
            <HiOutlineExternalLink className="h-4 w-4" />
          </button>
        )}
      </DrawerHeader>

      <DrawerItems>
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && data && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {data.batch.supplierName}
                </span>
                {data.batch.cedisName && (
                  <Badge color="success" size="sm">
                    CEDIS: {data.batch.cedisName}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {formatHumanDate(data.batch.entryDate, "long")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Inicial"
                value={batchType === "EGG"
                  ? <EggQuantityDisplay totalPieces={Number(data.summary.initialPieces)} />
                  : String(data.summary.initialPieces)}
              />
              <StatCard
                label="Vendidos"
                value={batchType === "EGG"
                  ? <EggQuantityDisplay totalPieces={Number(data.summary.soldPieces)} />
                  : String(data.summary.soldPieces)}
                color="text-green-400"
              />
              <StatCard
                label="Ajustes"
                value={batchType === "EGG"
                  ? <EggQuantityDisplay totalPieces={Number(data.summary.adjustedPieces)} />
                  : String(data.summary.adjustedPieces)}
                color="text-red-400"
              />
              <StatCard
                label="Disponible"
                value={batchType === "EGG"
                  ? <EggQuantityDisplay totalPieces={Number(data.summary.availablePieces)} />
                  : data.summary.formattedAvailable}
                color="text-blue-400"
                bold
              />
            </div>

            {data.batch.totalAmount && (
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                <p className="text-xs text-gray-400">Costo total</p>
                <p className="text-sm font-semibold text-white">
                  {formatMXN(Number(data.batch.totalAmount))}
                </p>
              </div>
            )}

            {highlightedMov && (
              <div>
                <h4 className="mb-2 text-xs font-bold tracking-widest text-blue-400 uppercase">
                  Venta que generó esta cuenta
                </h4>
                <div
                  ref={highlightRef}
                  className="rounded-lg border-2 border-blue-500/50 bg-blue-900/20 px-3 py-3"
                >
                  <MovementRow movement={highlightedMov} config={config} />
                </div>
              </div>
            )}

            {otherMovements.length > 0 && (
              <div>
                <h4 className="mb-3 text-xs font-bold tracking-widest text-gray-500 uppercase">
                  {highlightedMov ? "Otras ventas de esta remesa" : "Últimas ventas"}
                </h4>
                <div className="space-y-2">
                  {(highlightedMov ? otherMovements.slice(0, 8) : otherMovements.slice(0, 10)).map((mov) => (
                    <div
                      key={mov.id}
                      className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/30 px-3 py-2"
                    >
                      <MovementRow movement={mov} config={config} />
                    </div>
                  ))}
                </div>
                {otherMovements.length > (highlightedMov ? 8 : 10) && (
                  <p className="mt-2 text-center text-xs text-gray-500">
                    +{otherMovements.length - (highlightedMov ? 8 : 10)} movimientos más
                  </p>
                )}
              </div>
            )}

            {!highlightedMov && otherMovements.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Sin movimientos registrados.
              </p>
            )}

            <button
              onClick={handleGoToBatch}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Ver remesa completa
            </button>
          </div>
        )}
      </DrawerItems>
    </Drawer>
  );
};

const MovementRow = ({
  movement,
  config,
}: {
  movement: Movement;
  config: ReturnType<typeof UNIT_CONFIG>[keyof typeof UNIT_CONFIG] | null;
}) => (
  <>
    <div className="flex flex-col">
      <span className="text-sm text-white">
        {movement.concept || (movement.type === "SALE" ? "Venta" : "Baja")}
      </span>
      <span className="text-xs text-gray-500">
        {formatHumanDate(movement.date)}
      </span>
    </div>
    <div className="text-right">
      {config?.renderMovementQuantity(movement)}
      {movement.saleTotal != null && (
        <p className="text-xs text-gray-400">
          {formatMXN(movement.saleTotal)}
        </p>
      )}
    </div>
  </>
);

const StatCard = ({
  label,
  value,
  color = "text-gray-300",
  bold,
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
  bold?: boolean;
}) => (
  <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
    <p className="text-xs text-gray-400">{label}</p>
    <div className={`text-sm ${bold ? "font-bold" : "font-medium"} ${color}`}>
      {value}
    </div>
  </div>
);
