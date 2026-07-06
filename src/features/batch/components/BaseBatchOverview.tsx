import { useState, useRef, useEffect } from "react";
import { useBatchFullDetail } from "../api/batch.queries";
import type { BatchResponseDTO } from "../types.batch";
import { formatHumanDate } from "@/utils/date.utils";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { Spinner, Badge } from "flowbite-react";
import { BatchMovementModal } from "./BatchMovementModal";
import { UNIT_CONFIG } from "../config/unitConfig";
import { BatchEntryForm } from "./BatchEntryForm";
export const BaseBatchOverview: React.FC<{
  batch: BatchResponseDTO;
  statsComponent: React.ReactNode;
  footerComponent: React.ReactNode;
  autoExpandId?: number | null;
  tripId?: number | null;
}> = ({ batch, statsComponent, footerComponent, autoExpandId, tripId }) => {
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useBatchFullDetail(batch.id, { enabled: isOpen });

  useEffect(() => {
    if (autoExpandId !== null && autoExpandId !== undefined && autoExpandId === batch.id) {
      if (!isOpen) setIsOpen(true);
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, [autoExpandId, batch.id]);

  const onEditMovement = (movement: any) => {
    setSelectedMovement(movement);
    setIsSaleModalOpen(true);
  };
  const config = UNIT_CONFIG[batch.type];
  const MovementsTable = config.MovementsTable;
  return (
    <div
      ref={cardRef}
      id={`batch-${batch.id}`}
      className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-md transition-all duration-300"
    >
      <div
        className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              Remesa #{batch.id}
            </h3>
            <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
              {batch.supplierName}
            </span>
            {Number(batch.remainingQuantity) < 0 && (
              <Badge color="failure" size="sm">
                Disponibilidad negativa
              </Badge>
            )}
            {batch.cedisName && (
              <span className="rounded bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-300">
                CEDIS: {batch.cedisName}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formatHumanDate(batch.entryDate, "long")}
          </p>

          {/* KPI'S SUPERIORES (HeaderStats que hicimos) */}
          <div className="mt-2 flex gap-4 text-sm">{statsComponent}</div>
        </div>

        {/* ACCIONES DE LA REMESA */}
        <div className="flex items-center gap-3">
          {/* Botón Editar Remesa (NUEVO) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditBatchOpen(true);
            }}
            className="rounded-lg bg-blue-600/10 px-3 py-1 text-sm font-medium text-blue-400 transition-all hover:bg-blue-600 hover:text-white"
          >
            Editar
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSaleModalOpen(true);
            }}
            className="rounded-lg bg-blue-600/10 px-3 py-1 text-sm font-medium text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            + Salida
          </button>
          <div className="text-gray-500">
            {isOpen ? <HiChevronUp size={24} /> : <HiChevronDown size={24} />}
          </div>
        </div>
      </div>

      {/* CUERPO EXPANDIBLE */}
      {isOpen && (
        <div className="border-t border-gray-700 bg-gray-900/50 p-4">
          <h4 className="mb-4 text-center text-xs font-bold tracking-widest text-gray-500 uppercase">
            Ventas y bajas de esta remesa
          </h4>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <MovementsTable
                movements={data?.movements || []}
                onEdit={onEditMovement}
                unitType={batch.type}
                batchId={batch.id}
                tripId={tripId}
              />

              {/* FOOTER DE TOTALES (Inyectado - Imagen 144043.png) */}
              {footerComponent}
            </>
          )}
        </div>
      )}

      {/* MODALES */}
      {isSaleModalOpen && (
        <BatchMovementModal
          batch={batch}
          initialData={selectedMovement}
          onClose={() => {
            setIsSaleModalOpen(false);
            setSelectedMovement(null);
          }}
        />
      )}
      {isEditBatchOpen && (
        <BatchEntryForm
          open={isEditBatchOpen}
          unitType={batch.type}
          initialData={batch}
          onClose={() => setIsEditBatchOpen(false)}
        />
      )}
    </div>
  );
};
