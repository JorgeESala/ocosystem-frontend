import { Spinner } from "flowbite-react";
import type { Batch } from "../types.batch";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { BatchMovementsTable } from "./BatchMovementsTable";
import { useState } from "react";
import { useBatchFullDetail } from "../api/batch.queries";
import { formatHumanDate } from "@/utils/date.utils";
import { BatchMovementModal } from "./BatchMovementModal";
import { EggQuantityDisplay } from "./EggQuantityDisplay";

export const BusinessUnitBatchOverview: React.FC<{ batch: Batch }> = ({
  batch,
}) => {
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [selectedMovement, setSelectedMovement] = useState<any | null>(null);

  // Una sola query que trae TODO lo necesario
  const { data, isLoading } = useBatchFullDetail(batch.id, {
    enabled: isOpen,
  });

  const handleCloseModal = () => {
    setIsSaleModalOpen(false);
    setSelectedMovement(null);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-md">
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
            </div>
            <p className="text-xs text-gray-500">
              {formatHumanDate(batch.entryDate, "long")}
            </p>

            <div className="mt-2 flex gap-4 text-sm">
              {/* Inicial */}
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">
                  Inicial
                </span>
                <span className="font-medium text-white">
                  {batch.type === "EGG" ? (
                    <EggQuantityDisplay totalPieces={batch.initialQuantity} />
                  ) : (
                    batch.initialQuantity
                  )}
                </span>
              </div>

              {/* Vendido */}
              <div className="flex flex-col border-l border-gray-700 pl-4">
                <span className="text-[10px] text-gray-500 uppercase">
                  Vendido
                </span>
                <span className="font-medium text-blue-400">
                  {batch.type === "EGG" ? (
                    <EggQuantityDisplay
                      totalPieces={
                        data ? data.summary.soldPieces : batch.soldQuantity
                      }
                    />
                  ) : data ? (
                    data.summary.soldPieces
                  ) : (
                    batch.soldQuantity
                  )}
                </span>
              </div>

              {/* Disponible Centralizado */}
              <div className="flex flex-col border-l border-gray-700 pl-4">
                <span className="text-[10px] text-gray-500 uppercase">
                  Disponible
                </span>
                <div
                  className={`flex items-baseline gap-1 font-bold ${
                    (data?.summary.availablePieces ??
                      batch.remainingQuantity) <= 0
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {/* Si ya cargó la data detallada, usamos el string formateado del backend */}

                  <span className="text-sm">
                    <EggQuantityDisplay totalPieces={batch.remainingQuantity} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaleModalOpen(true); // Abrir para NUEVO movimiento
              }}
              className="rounded-lg bg-blue-600/10 px-3 py-1 text-sm font-medium text-blue-400 transition-all hover:bg-blue-600 hover:text-white"
            >
              + Salida
            </button>
            <div className="text-gray-500">
              {isOpen ? <HiChevronUp size={24} /> : <HiChevronDown size={24} />}
            </div>
          </div>
        </div>

        {/* Contenido Expandible (Tabla Unificada) */}
        {isOpen && (
          <div className="border-t border-gray-700 bg-gray-900/50 p-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : (
              <BatchMovementsTable
                movements={data?.movements || []}
                // Pasamos la función para que la tabla pueda activar la edición
                onEdit={(mov) => {
                  setSelectedMovement(mov);
                  setIsSaleModalOpen(true);
                }}
              />
            )}
          </div>
        )}
      </div>
      {isSaleModalOpen && (
        <BatchMovementModal
          batch={batch}
          // Si selectedMovement existe, el modal entra en modo "Edición"
          initialData={selectedMovement}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
