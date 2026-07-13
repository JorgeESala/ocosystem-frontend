"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BatchTable } from "../features/batch/branch/BatchTable";
import BatchEntryForm from "../features/batch/branch/BatchEntryForm";
import { BranchGlobalSummary } from "@/features/batch/branch/BranchGlobalSummary";
import {
  Button,
  Datepicker,
  Modal,
  ModalBody,
  ModalHeader,
  ToggleSwitch,
} from "flowbite-react";
import BranchMultiSelect from "./BranchMultiSelect";
import { useBranches } from "@/features/branches/branch/branch.queries";
import {
  fetchLatestBatches,
  fetchBatchesByBranchesAndDateRange,
  type Batch,
} from "@/services/api";
import { useSalesByBatches } from "@/features/batch/branch/api/sales.queries";
import { getCuentaKey } from "@/features/batch/branch/utils/cuenta";

export default function SalesAndBatches() {
  const [searchParams] = useSearchParams();
  const [openModal, setOpenModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [hasSearched, setHasSearched] = useState(
    !!searchParams.get("branch"),
  );
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);
  const [showOnlyWithAvailability, setShowOnlyWithAvailability] =
    useState(true);

  useEffect(() => {
    if (expandedBatchId === null) return;
    const timeout = setTimeout(() => setExpandedBatchId(null), 1500);
    return () => clearTimeout(timeout);
  }, [expandedBatchId]);

  const [selectedBranches, setSelectedBranches] = useState<number[]>(
    searchParams.get("branch") ? [Number(searchParams.get("branch"))] : [],
  );
  const queryClient = useQueryClient();
  const { data: branches } = useBranches();

  const isReady =
    hasSearched &&
    startDate !== null &&
    endDate !== null &&
    selectedBranches.length > 0;

  const latestQuery = useQuery<Batch[]>({
    queryKey: ["batches", "latest"],
    queryFn: fetchLatestBatches,
    enabled: !hasSearched,
  });

  const searchQuery = useQuery<Batch[]>({
    queryKey: ["batches", "search", selectedBranches, startDate, endDate],
    queryFn: () =>
      fetchBatchesByBranchesAndDateRange(
        selectedBranches,
        startDate!,
        endDate!,
      ),
    enabled: isReady,
  });

  const batches = hasSearched
    ? (searchQuery.data ?? [])
    : (latestQuery.data ?? []);

  const isBatchesLoading = hasSearched
    ? searchQuery.isLoading
    : latestQuery.isLoading;
  const batchesError = hasSearched ? searchQuery.error : latestQuery.error;

  const {
    data: bulkSales = [],
    isLoading: isBulkSalesLoading,
    isError: isBulkSalesError,
  } = useSalesByBatches(batches.map((b) => b.id));

  const cuentaCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const branchByBatchId = new Map<number, number | null>(
      batches.map((b) => [b.id, b.branchId]),
    );
    for (const sale of bulkSales) {
      if (sale.officeReceived) continue;
      if (sale.batchId == null) continue;
      const batch = { branchId: branchByBatchId.get(sale.batchId) ?? null };
      const key = getCuentaKey(sale, batch);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [bulkSales, batches]);

  const chickensRemainingByBatchId = useMemo(() => {
    const map = new Map<number, number>();
    if (isBulkSalesLoading) return map;
    const soldByBatchId = new Map<number, number>();
    for (const sale of bulkSales) {
      if (sale.batchId == null) continue;
      soldByBatchId.set(
        sale.batchId,
        (soldByBatchId.get(sale.batchId) ?? 0) + sale.quantitySold,
      );
    }
    for (const batch of batches) {
      const sold = soldByBatchId.get(batch.id) ?? 0;
      map.set(batch.id, (batch.chickenQuantity ?? 0) - sold);
    }
    return map;
  }, [bulkSales, batches, isBulkSalesLoading]);

  const displayedBatches = useMemo(() => {
    if (isBulkSalesLoading || isBulkSalesError) return batches;
    if (!showOnlyWithAvailability) return batches;
    return batches.filter((b) => chickensRemainingByBatchId.get(b.id) !== 0);
  }, [
    batches,
    chickensRemainingByBatchId,
    isBulkSalesLoading,
    isBulkSalesError,
    showOnlyWithAvailability,
  ]);

  const handleBatchCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["batches"] });
    setOpenModal(false);
  };
  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleScrollToBatch = (batchId: number) => {
    setExpandedBatchId(batchId);
    setTimeout(() => {
      document
        .getElementById(`batch-${batchId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  return (
    <div>
      <div className="mx-auto mt-6 max-w-xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            Entradas y Ventas
          </h1>

          <Button onClick={() => setOpenModal(true)}>Nueva Remesa</Button>
        </div>

        <div>
          {branches && (
            <BranchMultiSelect
              branches={branches}
              selected={selectedBranches}
              onChange={setSelectedBranches}
            />
          )}
        </div>

        <div>
          <label>Inicio</label>
          <Datepicker
            language="es-MX"
            value={startDate}
            onChange={(d) => setStartDate(d)}
          />
        </div>

        <div>
          <label>Fin</label>
          <Datepicker language="es-MX" onChange={(d) => setEndDate(d)} />
        </div>
        <div className="mt-2">
          <Button fullSized onClick={handleSearch}>
            Buscar
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-center">
          <ToggleSwitch
            checked={showOnlyWithAvailability}
            label="Solo con disponibilidad"
            onChange={setShowOnlyWithAvailability}
          />
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-7xl px-4">
        <BranchGlobalSummary
          batches={batches}
          branches={branches ?? []}
          bulkSales={bulkSales}
          isBulkSalesLoading={isBulkSalesLoading}
          isBulkSalesError={isBulkSalesError}
          onBatchClick={handleScrollToBatch}
          onSelectSale={handleScrollToBatch}
        />
      </div>

      <div className="mt-4">
        <BatchTable
          batches={displayedBatches}
          branches={branches ?? []}
          isLoading={isBatchesLoading}
          error={batchesError}
          expandedBatchId={expandedBatchId}
          cuentaCounts={cuentaCounts}
          chickensRemainingByBatchId={chickensRemainingByBatchId}
        />
      </div>

      {!isBatchesLoading &&
        !batchesError &&
        displayedBatches.length === 0 &&
        batches.length > 0 && (
          <div className="mt-4 px-4 text-center text-sm text-gray-500">
            {showOnlyWithAvailability
              ? "No hay remesas con disponibilidad en este periodo."
              : "No hay remesas para mostrar."}
          </div>
        )}

      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        size="md"
        popup
        className="bg-gray-800"
      >
        <ModalHeader></ModalHeader>

        <ModalBody>
          <BatchEntryForm
            open={openModal}
            onClose={() => setOpenModal(false)}
            onSuccess={handleBatchCreated}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}
