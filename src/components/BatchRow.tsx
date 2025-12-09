import { useState } from "react";
import { Button, Spinner, Alert } from "flowbite-react";
import { HiChevronDown, HiChevronUp, HiExclamation } from "react-icons/hi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchBatchSalesByBatch,
  type Batch,
  type DailyBatchSale,
} from "../services/api";

import { BatchSalesTable } from "./BatchSalesTable";
import SaleEntryForm from "./SaleEntryForm";
import BatchEntryForm from "./BatchEntryForm";

export const BatchRow: React.FC<{ batch: Batch }> = ({ batch }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const {
    data: sales = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["batchSales", batch.id],
    queryFn: () => fetchBatchSalesByBatch(batch.id),
    staleTime: 1000 * 60 * 5,
  });

  const chickensSold = sales.reduce((sum, s) => sum + s.quantitySold, 0);
  const chickensRemaining = batch.chickenQuantity - chickensSold;

  function getRemainingColor(value: number) {
    if (value > 0) return "text-yellow-400"; // faltan
    if (value === 0) return "text-green-400"; // exacto
    return "text-red-500"; // se pasaron
  }

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
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-md transition-all">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4 transition hover:bg-gray-700"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="mx-auto flex flex-col items-center">
          <h3 className="text-center text-lg font-semibold text-white">
            Remesa #{batch.id} — {batch.branch.name}
          </h3>

          <p className="text-center text-sm text-gray-400">
            {batch.provider} •{" "}
            {new Date(`${batch.date}T00:00:00`).toLocaleDateString("es-MX")}
          </p>

          <div className="mt-1 flex flex-wrap justify-center gap-3 text-sm text-gray-300">
            <span>🐔 {batch.chickenQuantity} pollos</span>
            <span className={getRemainingColor(chickensRemaining)}>
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
            <BatchSalesTable batch={batch} sales={sales} />
          )}
        </div>
      )}
    </div>
  );
};
