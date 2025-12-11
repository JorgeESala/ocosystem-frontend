import { Spinner, Alert } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  fetchLatestBatches,
  fetchBatchSalesByBatch,
  type Batch,
} from "../services/api";
import { BatchRow } from "./BatchRow";

export const BatchTable: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: batches = [],
    isLoading,
    error,
  } = useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: fetchLatestBatches,
  });

  // --- PREFETCH DE VENTAS POR REMESA ---
  useEffect(() => {
    if (batches.length === 0) return;

    batches.forEach((batch) => {
      queryClient.prefetchQuery({
        queryKey: ["batchSales", batch.id],
        queryFn: () => fetchBatchSalesByBatch(batch.id),
        staleTime: 1000 * 60 * 5, // cache 5 minutos
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
