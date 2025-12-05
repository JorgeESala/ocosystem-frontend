import { Spinner, Alert } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";

import { fetchLatestBatches, type Batch } from "../services/api";
import { BatchRow } from "./BatchRow";

export const BatchTable: React.FC = () => {
  const {
    data: batches = [],
    isLoading,
    error,
  } = useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: fetchLatestBatches,
  });

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
