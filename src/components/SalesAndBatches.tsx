"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [openModal, setOpenModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);

  useEffect(() => {
    if (expandedBatchId === null) return;
    const timeout = setTimeout(() => setExpandedBatchId(null), 1500);
    return () => clearTimeout(timeout);
  }, [expandedBatchId]);

  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
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
          <Datepicker value={startDate} onChange={(d) => setStartDate(d)} />
        </div>

        <div>
          <label>Fin</label>
          <Datepicker onChange={(d) => setEndDate(d)} />
        </div>
        <div className="mt-2">
          <Button fullSized onClick={handleSearch}>
            Buscar
          </Button>
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
          batches={batches}
          branches={branches ?? []}
          isLoading={isBatchesLoading}
          error={batchesError}
          expandedBatchId={expandedBatchId}
          cuentaCounts={cuentaCounts}
        />
      </div>

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
