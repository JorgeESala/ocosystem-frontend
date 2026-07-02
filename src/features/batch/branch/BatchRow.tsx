import { useEffect, useState } from "react";
import { Badge, Button, Spinner, Alert } from "flowbite-react";
import { HiChevronDown, HiChevronUp, HiExclamation } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";

import { type Batch, type Branch } from "../../../services/api";

import { BatchSalesTable } from "./BatchSalesTable";
import SaleEntryForm from "../../../components/SaleEntryForm";
import BatchEntryForm from "./BatchEntryForm";
import {
  useSalesByBatch,
  useUpdateSaleOfficeStatus,
} from "./api/sales.queries";

interface BatchRowProps {
  batch: Batch;
  branches: Branch[];
  autoExpandId?: number | null;
  cuentaCounts: Map<string, number>;
  chickensRemaining?: number;
}

export const BatchRow: React.FC<BatchRowProps> = ({
  batch,
  branches,
  autoExpandId,
  cuentaCounts,
  chickensRemaining: chickensRemainingProp,
}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  useEffect(() => {
    if (autoExpandId === batch.id) {
      setIsOpen(true);
    }
  }, [autoExpandId, batch.id]);

  const {
    data: sales = [],
    isLoading,
    isError,
  } = useSalesByBatch(batch.id, isOpen);

  const branchName =
    branches.find((b) => b.id === batch.branchId)?.name ??
    (batch.branchId != null ? `Sucursal #${batch.branchId}` : "Sin sucursal");

  const chickensSold = sales.reduce((sum, s) => sum + s.quantitySold, 0);
  const chickensRemaining = batch.chickenQuantity - chickensSold;

  function getRemainingStyle(remaining: number, total: number) {
    if (total <= 0) return { color: "hsl(0, 80%, 50%)" };

    const ratio = Math.max(0, Math.min(remaining / total, 1));
    const hue = ratio * 120; // 0 = rojo, 120 = verde

    return {
      color: `hsl(${hue}, 80%, 45%)`,
    };
  }
  const { mutateAsync: updateOfficeStatus } = useUpdateSaleOfficeStatus(
    batch.id,
  );

  const handleToggleOfficeStatus = async (
    saleId: number,
    currentStatus: boolean,
  ) => {
    await updateOfficeStatus({
      saleId: Number(saleId),
      officeReceived: !currentStatus,
    });
  };
  const handleSaleCreated = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["batchSales", batch.id],
    });
  };

  const handleBatchUpdated = async () => {
    await queryClient.invalidateQueries({ queryKey: ["batches"] });
    setEditingBatch(null);
  };

  return (
    <div
      id={`batch-${batch.id}`}
      className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-md transition-all"
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4 transition hover:bg-gray-700"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-center text-lg font-semibold text-white">
              Remesa #{batch.id} — {branchName}
            </h3>
            {typeof chickensRemainingProp === "number" &&
              chickensRemainingProp < 0 && (
                <Badge color="failure" size="sm">
                  Disponibilidad negativa
                </Badge>
              )}
          </div>

          <p className="text-center text-sm text-gray-400">
            {batch.provider} •{" "}
            {new Date(`${batch.date}T00:00:00`).toLocaleDateString("es-MX")}
          </p>

          <div className="mt-1 flex flex-wrap justify-center gap-3 text-sm text-gray-300">
            <span>🐔 {batch.chickenQuantity} pollos</span>
            <span
              style={getRemainingStyle(
                chickensRemaining,
                batch.chickenQuantity,
              )}
            >
              🧮 Disponibles: {chickensRemaining}
            </span>
            <span>⚖️ {batch.kgTotal} kg</span>
            <span>💲{batch.pricePerKg}/kg</span>
            <span>
              💰 Total: $
              {Number(batch.priceTotal?.toFixed(2)).toLocaleString("es-MX") ??
                "-"}
            </span>
            <span>
              📏 Peso promedio: {batch.avgChickenWeight?.toFixed(2) ?? "-"} kg
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            color="light"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBatch(batch);
            }}
          >
            Agregar venta
          </Button>

          {/* Botón Editar */}
          <Button
            size="xs"
            color="blue"
            onClick={(e) => {
              e.stopPropagation();
              setEditingBatch(batch);
            }}
          >
            Editar
          </Button>

          <Button size="xs" color="gray" pill>
            {isOpen ? <HiChevronUp /> : <HiChevronDown />}
          </Button>
        </div>
      </div>

      {/* Modal agregar venta */}
      {selectedBatch && (
        <SaleEntryForm
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onSuccess={handleSaleCreated}
        />
      )}

      {/* Modal editar remesa */}
      {editingBatch && (
        <BatchEntryForm
          open={!!editingBatch}
          batch={editingBatch}
          mode="edit"
          onClose={() => setEditingBatch(null)}
          onSuccess={handleBatchUpdated}
        />
      )}

      {/* Subtabla */}
      {isOpen && (
        <div className="border-t border-gray-700 bg-gray-900 p-4">
          <h4 className="mb-3 text-center text-lg font-semibold text-gray-200">
            Ventas de esta remesa
          </h4>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : isError ? (
            <Alert color="failure" icon={HiExclamation}>
              Error al cargar ventas.
            </Alert>
          ) : (
            <BatchSalesTable
              batch={batch}
              sales={sales}
              cuentaCounts={cuentaCounts}
              onToggleOfficeStatus={handleToggleOfficeStatus}
            />
          )}
        </div>
      )}
    </div>
  );
};
