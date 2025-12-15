"use client";

import { useState } from "react";
import { BatchTable } from "./BatchTable";
import BatchEntryForm from "./BatchEntryForm";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useQueryClient } from "@tanstack/react-query";
import BranchMultiSelect from "./BranchMultiSelect";
import { useBranches } from "../context/BranchContext";

export default function SalesAndBatches() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const { branches } = useBranches();
  const handleBatchCreated = () => {
    // Actualiza automáticamente las remesas
    queryClient.invalidateQueries({ queryKey: ["batches"] });

    // Cierra el modal
    setOpenModal(false);
  };
  return (
    <div>
      <div className="mx-auto mt-6 max-w-xl">
        {/* --- Header igual al de Gastos --- */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            Entradas y Ventas
          </h1>

          <Button onClick={() => setOpenModal(true)}>Nueva Remesa</Button>
        </div>

        {/* --- MultiSelect centrado y con altura limitada --- */}

        <BranchMultiSelect
          branches={branches}
          selected={selectedBranches}
          onChange={setSelectedBranches}
        />

        {/* --- Botón Buscar igual al de Gastos --- */}
        <div className="mt-2">
          <Button fullSized>Buscar</Button>
        </div>
      </div>
      {/* --- Tabla --- */}
      <div className="mt-4">
        <BatchTable />
      </div>

      {/* --- Modal --- */}
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
