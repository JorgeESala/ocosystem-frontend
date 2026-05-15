import React, { useState } from "react";
import { Spinner, Alert } from "flowbite-react";
import { useBatches } from "../api/batch.queries";
import type { Batch, BatchPageProps } from "../types.batch";

import { UNIT_CONFIG } from "../config/unitConfig";
import { BatchEntryForm } from "../components/BatchEntryForm";

export const BatchPage: React.FC<BatchPageProps> = ({ unitType }) => {
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const { data: batches = [], isLoading, isError } = useBatches(unitType);

  // Obtenemos la configuración según el unitType
  const config = UNIT_CONFIG[unitType];
  const BatchOverview = config.overviewComponent;

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

      <div className="grid grid-cols-1 gap-4">
        {batches.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No hay remesas registradas para esta unidad.
          </div>
        ) : (
          batches.map((batch: Batch) => (
            <BatchOverview key={batch.id} batch={batch} />
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
