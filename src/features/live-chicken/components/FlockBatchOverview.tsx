import { useState } from "react";
import { Alert, Button, Spinner } from "flowbite-react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";

import { useInboundBatchSales } from "@/features/live-chicken/api/inboundBatchSales.queries";
import { useUpdateInboundBatch } from "@/features/live-chicken/api/inboundBatches.queries";

import BatchEntryForm from "./BatchEntryForm";
import { BatchSalesTable } from "./BatchSalesTable";

import type {
  BatchMovement,
  InboundBatch,
  InboundBatchFormValues,
  InboundBatchSale,
} from "../types";
import BatchEntryModal from "./BatchEntryModal";
import { useChickenLossesByBatchId } from "../ChickenLoss/api/chickenLoss.queries";
import type { ChickenLoss } from "../ChickenLoss/types/chickenLoss.types";
import { formatHumanDate } from "@/utils/date.utils";

export const FlockBatchOverview: React.FC<{ batch: InboundBatch }> = ({
  batch,
}) => {
  const queryClient = useQueryClient();
  const updateBatchMutation = useUpdateInboundBatch();
  type EntryType = "SALE" | "LOSS";
  type EntryMode = "create" | "edit";

  const [entryType, setEntryType] = useState<EntryType>("SALE");
  const [entryMode, setEntryMode] = useState<EntryMode>("create");

  const [saleToEdit, setSaleToEdit] = useState<InboundBatchSale | undefined>();
  const [lossToEdit, setLossToEdit] = useState<ChickenLoss | undefined>();

  const [isOpen, setIsOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<InboundBatch | null>(null);
  const [entryBatch, setEntryBatch] = useState<InboundBatch | null>(null);

  const {
    data: sales = [],
    isLoading,
    isError,
  } = useInboundBatchSales(batch.id);

  const { data: losses = [] } = useChickenLossesByBatchId(batch.id);

  const closeEntryModal = () => {
    setEntryBatch(null);
    setSaleToEdit(undefined);
    setLossToEdit(undefined);
  };
  const movements: BatchMovement[] = [
    ...sales.map((s) => ({
      type: "SALE" as const,
      id: s.id,
      date: new Date(s.date),
      quantity: s.quantitySold,
      weight: s.kgSold,
      kgSent: s.kgSent,
      amount: s.saleTotal,
      employeeName: s.employeeName,
      routeName: s.routeName,
      original: s,
    })),
    ...losses.map((l) => ({
      type: "LOSS" as const,
      id: l.id,
      date: l.date,
      quantity: l.quantity,
      weight: l.weight,
      amount: l.lossAmount,
      original: l,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const chickensSold = sales.reduce((sum, s) => sum + s.quantitySold, 0);
  const chickensRemaining = batch.chickenQuantity - chickensSold;

  function getRemainingColor(value: number) {
    if (value > 0) return "text-yellow-400"; // faltan
    if (value === 0) return "text-green-400"; // exacto
    return "text-red-500"; // se pasaron
  }
  const handleBatchUpdate = (values: InboundBatchFormValues) => {
    if (!editingBatch) return;

    updateBatchMutation.mutate(
      {
        id: editingBatch.id,
        payload: {
          supplierId: values.supplierId!,
          date: values.date,
          realWeight: Number(values.realWeight),
          declaredWeight: Number(values.declaredWeight),
          chickenQuantity: Number(values.chickenQuantity),
          pricePerKg: Number(values.pricePerKg),
        },
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["batches"] });
          setEditingBatch(null);
        },
      },
    );
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
            Remesa #{batch.id}
          </h3>

          <p className="text-center text-sm text-gray-400">
            {batch.supplierName} • {formatHumanDate(batch.date, "short")}
          </p>

          <div className="mt-1 flex flex-wrap justify-center gap-3 text-sm text-gray-300">
            <span>🐔 {batch.chickenQuantity} pollos</span>
            <span className={getRemainingColor(chickensRemaining)}>
              🧮 Disponibles: {chickensRemaining}
            </span>
            <span>
              📏 Peso promedio: {batch.avgWeight?.toFixed(2) ?? "-"} kg
            </span>
            <span>Peso Real {batch.realWeight} kg</span>
            <span>Peso Declarado {batch.declaredWeight} kg</span>
            <span>
              📏 Diferencia de kilos{" "}
              {Number(batch.declaredWeight - batch.realWeight).toLocaleString(
                "es-MX",
              )}{" "}
              kg
            </span>
            <span>
              Diferencia en💲: $
              {Number(
                (batch.totalPaid - batch.realWeight * batch.pricePerKg).toFixed(
                  3,
                ),
              ).toLocaleString("es-MX")}
            </span>
            <span>💲Precio proveedor {batch.pricePerKg}/kg</span>
            <span>
              💲Precio real {(batch.totalPaid / batch.realWeight).toFixed(3)}/kg
            </span>
            <span>
              💰 Total: $
              {Number(batch.totalPaid?.toFixed(2)).toLocaleString("es-MX") ??
                "-"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            color="light"
            onClick={(e) => {
              e.stopPropagation();
              setEntryType("SALE");
              setEntryMode("create");
              setEntryBatch(batch);
            }}
          >
            Agregar salida
          </Button>

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

      {/* Modal de entradas (ventas / bajas) */}
      {entryBatch && (
        <BatchEntryModal
          batch={entryBatch}
          type={entryType}
          mode={entryMode}
          saleToEdit={saleToEdit}
          lossToEdit={lossToEdit}
          onClose={closeEntryModal}
          onSuccess={async () => {
            await queryClient.invalidateQueries({
              queryKey: ["batchSales", entryBatch.id],
            });
            closeEntryModal();
          }}
        />
      )}

      {/* Editar remesa */}
      {editingBatch && (
        <BatchEntryForm
          open
          mode="edit"
          batch={editingBatch}
          onClose={() => setEditingBatch(null)}
          onSubmit={handleBatchUpdate}
        />
      )}

      {/* Subtabla */}
      {isOpen && (
        <div className="border-t border-gray-700 bg-gray-900 p-4">
          <h4 className="mb-3 text-center text-lg font-semibold text-gray-200">
            Ventas y bajas de esta remesa
          </h4>

          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <Alert color="failure">Error al cargar ventas</Alert>
          ) : (
            <BatchSalesTable
              batch={batch}
              movements={movements}
              onEditSale={(sale) => {
                setEntryType("SALE");
                setEntryMode("edit");
                setSaleToEdit(sale);
                setEntryBatch(batch);
              }}
              onEditLoss={(loss) => {
                setEntryType("LOSS");
                setEntryMode("edit");
                setLossToEdit(loss);
                setEntryBatch(batch);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
