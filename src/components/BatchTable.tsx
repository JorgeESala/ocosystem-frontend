import React, { useEffect, useState } from "react";
import { Button, Spinner, Alert, Label } from "flowbite-react";
import { HiChevronDown, HiChevronUp, HiExclamation } from "react-icons/hi";
import {
  Batch,
  fetchBatches,
  fetchBatchSalesByBatch,
  type DailyBatchSale,
} from "../services/api";
import { BatchSalesTable } from "./BatchSalesTable";
import SaleEntryForm from "./SaleEntryForm";

export const BatchTable: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [batchSales, setBatchSales] = useState<
    Record<number, DailyBatchSale[]>
  >({});

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await fetchBatches();
        setBatches(data);
      } catch (err) {
        console.error("Error fetching batches:", err);
        setError("No se pudieron cargar las remesas.");
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);
  const addSales = async (batch: Batch) => {
    const data = await fetchBatchSalesByBatch(batch.id);
    setBatchSales((prev) => ({
      ...prev,
      [batch.id]: data,
    }));
  };
  const toggleExpand = (id: number) => {
    const newId = expandedBatchId === id ? null : id;
    setExpandedBatchId(newId);
    if (newId) {
      const newBatch = batches.find((batch) => batch.id === newId);
      if (newBatch) addSales(newBatch);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 transform">
        <Alert color="failure" icon={HiExclamation}>
          <span className="font-medium">Error:</span> {error}
        </Alert>
      </div>
    );

  return (
    <div className="space-y-6 p-4">
      <div>
        <Label htmlFor="month">Mes</Label>
        <input
          id="month"
          name="month"
          type="month"
          className="block w-full rounded-lg border border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {batches.map((batch) => (
        <div
          key={batch.id}
          className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-md transition-all"
        >
          {/* Cabecera del lote */}
          <div
            className="flex cursor-pointer items-center justify-between p-4 transition hover:bg-gray-700"
            onClick={() => toggleExpand(batch.id)}
          >
            {/* Información del batch centrada */}
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
                <span>⚖️ {batch.kgTotal} kg</span>
                <span>💲{batch.pricePerKg}/kg</span>
                <span>
                  💰 Total: $
                  {Number(batch.priceTotal?.toFixed(2)).toLocaleString(
                    "es-MX",
                  ) ?? "-"}
                </span>
                <span>
                  📏 Peso promedio: {batch.avgChickenWeight?.toFixed(2) ?? "-"}{" "}
                  kg
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="xs"
                color="light"
                onClick={() => setSelectedBatch(batch)}
              >
                Agregar venta
              </Button>
              <Button
                size="xs"
                color="gray"
                pill
                onClick={() => toggleExpand(batch.id)}
              >
                {expandedBatchId === batch.id ? (
                  <HiChevronUp className="h-4 w-4" />
                ) : (
                  <HiChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {selectedBatch && (
              <SaleEntryForm
                batch={selectedBatch}
                onClose={() => setSelectedBatch(null)}
                onSuccess={async () => {
                  if (selectedBatch) {
                    addSales(selectedBatch);
                  }
                }}
              />
            )}
          </div>

          {/* Subtabla: ventas */}
          {expandedBatchId === batch.id && (
            <div className="border-t border-gray-700 bg-gray-900 p-4">
              <h4 className="mb-3 text-center text-lg font-semibold text-gray-200">
                Ventas de esta remesa
              </h4>
              <BatchSalesTable
                batch={batch}
                sales={batchSales[batch.id] || []}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
