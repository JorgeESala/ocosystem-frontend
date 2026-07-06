import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Spinner, Alert, Button, Datepicker, ToggleSwitch } from "flowbite-react";
import { useBatches } from "../api/batch.queries";
import type { Batch, BatchPageProps } from "../types.batch";

import { UNIT_CONFIG } from "../config/unitConfig";
import { BatchEntryForm } from "../components/BatchEntryForm";
import { GlobalAvailabilitySummary } from "../components/GlobalAvailabilitySummary";
import { WeeklySalesChart } from "../components/WeeklySalesChart";
import { SalesByClientChart } from "../components/SalesByClientChart";

type TabKey = "availability" | "weekly" | "clients";

const THIRTY_DAYS_AGO = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
})();

export const BatchPage: React.FC<BatchPageProps> = ({ unitType }) => {
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(THIRTY_DAYS_AGO);
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState<TabKey>("availability");
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);
  const [showOnlyWithAvailability, setShowOnlyWithAvailability] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (expandedBatchId === null) return;
    const timeout = setTimeout(() => setExpandedBatchId(null), 300);
    return () => clearTimeout(timeout);
  }, [expandedBatchId]);

  const { data: batches = [], isLoading, isError } = useBatches(unitType);

  const config = UNIT_CONFIG[unitType];
  const BatchOverview = config.overviewComponent;

  const filteredBatches = batches.filter((batch: Batch) => {
    if (showOnlyWithAvailability && Number(batch.remainingQuantity) === 0) {
      return false;
    }
    if (!startDate || !endDate) return true;
    const entryDate = new Date(`${batch.entryDate}T00:00:00`);
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return entryDate >= start && entryDate <= end;
  });

  const handleBatchClick = useCallback((batchId: number) => {
    setExpandedBatchId(batchId);
    setTimeout(() => {
      document.getElementById(`batch-${batchId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, []);

  useEffect(() => {
    const raw = searchParams.get("batch");
    const targetId = raw != null ? Number(raw) : NaN;
    if (!Number.isFinite(targetId) || targetId <= 0) return;
    if (isLoading) return;
    const exists = batches.some((b: Batch) => b.id === targetId);
    if (!exists) return;
    handleBatchClick(targetId);
    const next = new URLSearchParams(searchParams);
    next.delete("batch");
    setSearchParams(next, { replace: true });
  }, [searchParams, batches, isLoading, handleBatchClick, setSearchParams]);

  const tripIdFromUrl = useMemo(() => {
    const raw = searchParams.get("tripId");
    return raw != null ? Number(raw) : null;
  }, [searchParams]);

  const handleClearFilter = useCallback(() => {
    setStartDate(THIRTY_DAYS_AGO);
    setEndDate(new Date());
    setShowOnlyWithAvailability(true);
  }, []);

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );

  if (isError) {
    return (
      <Alert color="failure" className="my-4">
        Error al cargar las remesas de {config.label}.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <header className="flex items-center justify-between border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Remesas de {config.label}
          </h1>
          <p className="text-gray-400">{config.description}</p>
        </div>
        <button
          onClick={() => setIsBatchModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nueva Remesa
        </button>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Inicio</label>
          <Datepicker
            language="es-MX"
            value={startDate}
            onChange={(d) => d && setStartDate(d)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Fin</label>
          <Datepicker
            language="es-MX"
            value={endDate}
            onChange={(d) => d && setEndDate(d)}
          />
        </div>
        <Button size="xs" color="gray" onClick={handleClearFilter}>
          Limpiar
        </Button>
        <div className="ml-auto flex items-center gap-2 pb-1">
          <ToggleSwitch
            checked={showOnlyWithAvailability}
            label="Solo con disponibilidad"
            onChange={setShowOnlyWithAvailability}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("availability")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "availability"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Disponibilidad
        </button>
        <button
          onClick={() => setActiveTab("weekly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "weekly"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Ventas Semanales
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "clients"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Ventas por Cliente
        </button>
      </div>

      {activeTab === "availability" && (
        <GlobalAvailabilitySummary
          batches={filteredBatches}
          unitType={unitType}
          onBatchClick={handleBatchClick}
        />
      )}

      {activeTab === "weekly" && (
        <WeeklySalesChart
          unitType={unitType}
          startDate={startDate}
          endDate={endDate}
        />
      )}

      {activeTab === "clients" && (
        <SalesByClientChart
          unitType={unitType}
          startDate={startDate}
          endDate={endDate}
        />
      )}

      <div className="space-y-4">
        {filteredBatches.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            {showOnlyWithAvailability
              ? "No hay remesas con disponibilidad en este periodo."
              : "No hay remesas registradas en este periodo."}
          </div>
        ) : (
          filteredBatches.map((batch: Batch) => (
            <BatchOverview
              key={batch.id}
              batch={batch}
              autoExpandId={expandedBatchId}
              tripId={tripIdFromUrl}
            />
          ))
        )}
      </div>

      {isBatchModalOpen && (
        <BatchEntryForm
          open={isBatchModalOpen}
          unitType={unitType}
          onClose={() => setIsBatchModalOpen(false)}
        />
      )}
    </div>
  );
};
