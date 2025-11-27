"use client";

import { useState } from "react";
import { BatchTable } from "./BatchTable";
import BatchEntryForm from "./BatchEntryForm";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";

export default function SalesAndBatches() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="space-y-6 text-center">
      {/* Encabezado + botón */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Entradas y Ventas</h1>

        <Button onClick={() => setOpenModal(true)}>Nuevo lote</Button>
      </div>

      {/* Tabla */}
      <BatchTable />

      {/* Modal Flowbite */}
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
          // onCreated={() => {
          //   setOpenModal(false); // cerrar modal después de crear
          // }}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}
