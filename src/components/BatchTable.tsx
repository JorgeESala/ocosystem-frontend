import { Spinner, Alert } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  fetchLatestBatches,
  fetchBatchSalesByBatch,
  fetchBatchesByBranchesAndDateRange,
  type Batch,
} from "../services/api";
import { BatchRow } from "./BatchRow";

interface BatchTableProps {
  startDate: Date | null;
  endDate: Date | null;
  branchIds: number[];
  enabled: boolean;
}

export const BatchTable: React.FC<BatchTableProps> = ({
  startDate,
  endDate,
  branchIds,
  enabled,
}) => {
  const queryClient = useQueryClient();

  const isReady =
    enabled && startDate !== null && endDate !== null && branchIds.length > 0;

  const latestQuery = useQuery<Batch[]>({
    queryKey: ["batches", "latest"],
    queryFn: fetchLatestBatches,
    enabled: !enabled,
  });

  const searchQuery = useQuery<Batch[]>({
    queryKey: ["batches", "search", branchIds, startDate, endDate],
    queryFn: () =>
      fetchBatchesByBranchesAndDateRange(branchIds, startDate!, endDate!),
    enabled: isReady,
  });

  const batches = enabled ? (searchQuery.data ?? []) : (latestQuery.data ?? []);

  const isLoading = enabled ? searchQuery.isLoading : latestQuery.isLoading;

  const error = enabled ? searchQuery.error : latestQuery.error;

  useEffect(() => {
    if (batches.length === 0) return;

    batches.forEach((batch) => {
      queryClient.prefetchQuery({
        queryKey: ["batchSales", batch.id],
        queryFn: () => fetchBatchSalesByBatch(batch.id),
        staleTime: 1000 * 60 * 5,
      });
    });
  }, [batches, queryClient]);

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <Alert color="failure" icon={HiExclamation}>
        No se pudieron cargar las remesas.
      </Alert>
    );

  return (
    <div className="space-y-6 p-4">
      {batches.map((batch) => (
        <BatchRow key={batch.id} batch={batch} />
      ))}
    </div>
  );
};
