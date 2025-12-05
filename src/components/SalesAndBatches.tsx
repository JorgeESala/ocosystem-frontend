"use client";

import { useState } from "react";
import { BatchTable } from "./BatchTable";
import BatchEntryForm from "./BatchEntryForm";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SalesAndBatches() {
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  const handleBatchCreated = () => {
    // ❗ Actualiza automáticamente las remesas
    queryClient.invalidateQueries({ queryKey: ["batches"] });

    // Cierra el modal
    setOpenModal(false);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Entradas y Ventas</h1>
        <Button onClick={() => setOpenModal(true)}>Nueva Remesa</Button>
      </div>

      <BatchTable />

      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        size="md"
        popup
        className="bg-gray-800"
      >
        <ModalHeader></ModalHeader>

        <ModalBody>
          {/* 🔥 Le pasamos la función que refresca la tabla */}
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
