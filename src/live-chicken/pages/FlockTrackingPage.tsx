"use client";

import { useState } from "react";
import { FlockBatchList } from "../components/FlockBatchList";
import BatchEntryForm from "../components/BatchEntryForm";
import {
  Button,
  Datepicker,
  Modal,
  ModalBody,
  ModalHeader,
} from "flowbite-react";
import { useQueryClient } from "@tanstack/react-query";

export default function FlockTrackingPage() {
  const [openModal, setOpenModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [hasSearched, setHasSearched] = useState(false);

  const queryClient = useQueryClient();
  const handleBatchCreated = () => {
    // Actualiza automáticamente las remesas
    queryClient.invalidateQueries({ queryKey: ["batches"] });

    // Cierra el modal
    setOpenModal(false);
  };
  const handleSearch = () => {
    setHasSearched(true);
  };
  return (
    <div>
      <h1 className="mt-4 text-center text-2xl font-bold">Pollo Vivo</h1>
      <div className="mx-auto mt-6 max-w-xl">
        {/* --- Header igual al de Gastos --- */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            Remesas y Ventas
          </h1>

          <Button onClick={() => setOpenModal(true)}>Nueva Remesa</Button>
        </div>

        {/* --- MultiSelect centrado y con altura limitada --- */}

        <div>
          <label>Inicio</label>
          <Datepicker onChange={(d) => setStartDate(d)} />
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
      {/* --- Tabla --- */}
      <div className="mt-4">
        <FlockBatchList
          startDate={startDate}
          endDate={endDate}
          enabled={hasSearched}
        />
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
