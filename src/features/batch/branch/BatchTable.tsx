import { Spinner, Alert } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";

import { type Batch, type Branch } from "../../../services/api";
import { BatchRow } from "./BatchRow";

interface BatchTableProps {
  batches: Batch[];
  branches: Branch[];
  isLoading: boolean;
  error: unknown;
  expandedBatchId?: number | null;
  cuentaCounts: Map<string, number>;
}

export const BatchTable: React.FC<BatchTableProps> = ({
  batches,
  branches,
  isLoading,
  error,
  expandedBatchId,
  cuentaCounts,
}) => {
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
        <BatchRow
          key={batch.id}
          batch={batch}
          branches={branches}
          autoExpandId={expandedBatchId}
          cuentaCounts={cuentaCounts}
        />
      ))}
    </div>
  );
};
