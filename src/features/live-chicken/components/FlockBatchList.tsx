import { Spinner, Alert } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";

import { useLatestInboundBatches } from "@/features/live-chicken/api/inboundBatches.queries";
import { useInboundBatchesByDateRange } from "@/features/live-chicken/api/inboundBatches.queries";
// import { fetchBatchSalesByBatch } from "@/domains/live-chicken/api/inboundBatchSales.api";

import { FlockBatchOverview } from "./FlockBatchOverview";
import type { InboundBatch } from "../types";

interface FlockBatchListProps {
  startDate: Date | null;
  endDate: Date | null;
  enabled: boolean;
}

export const FlockBatchList: React.FC<FlockBatchListProps> = ({
  startDate,
  endDate,
  enabled,
}) => {
  const isSearchMode = enabled && !!startDate && !!endDate;

  const latestQuery = useLatestInboundBatches(15);

  const rangeQuery = useInboundBatchesByDateRange(
    startDate,
    endDate,
    isSearchMode,
  );

  const batches: InboundBatch[] = isSearchMode
    ? (rangeQuery.data ?? [])
    : (latestQuery.data ?? []);

  const isLoading = isSearchMode ? rangeQuery.isLoading : latestQuery.isLoading;

  const isError = isSearchMode ? rangeQuery.isError : latestQuery.isError;

  // ✅ Prefetch ventas por remesa
  // useEffect(() => {
  //   if (!batches.length) return;

  //   batches.forEach((batch) => {
  //     queryClient.prefetchQuery({
  //       queryKey: ["batchSales", batch.id],
  //       queryFn: () => fetchBatchSalesByBatch(batch.id),
  //       staleTime: 1000 * 60 * 5,
  //     });
  //   });
  // }, [batches, queryClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert color="failure" icon={HiExclamation}>
        No se pudieron cargar las remesas.
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {batches.map((batch) => (
        <FlockBatchOverview key={batch.id} batch={batch} />
      ))}
    </div>
  );
};
