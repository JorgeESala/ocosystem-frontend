"use client";

import { useState } from "react";
import { BatchTable } from "../features/batch/branch/BatchTable";
import BatchEntryForm from "../features/batch/branch/BatchEntryForm";
import {
  Button,
  Datepicker,
  Modal,
  ModalBody,
  ModalHeader,
} from "flowbite-react";
import { useQueryClient } from "@tanstack/react-query";
import BranchMultiSelect from "./BranchMultiSelect";
import { useBranches } from "@/features/branches/branch/branch.queries";

export default function SalesAndBatches() {
  const [openModal, setOpenModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const { data: branches } = useBranches();
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
      <div className="mx-auto mt-6 max-w-xl">
        {/* --- Header igual al de Gastos --- */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            Entradas y Ventas
          </h1>

          <Button onClick={() => setOpenModal(true)}>Nueva Remesa</Button>
        </div>

        {/* --- MultiSelect centrado y con altura limitada --- */}
        <div>
          {branches && (
            <BranchMultiSelect
              branches={branches}
              selected={selectedBranches}
              onChange={setSelectedBranches}
            />
          )}
        </div>

        <div>
          <label>Inicio</label>
          <Datepicker value={startDate} onChange={(d) => setStartDate(d)} />
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
        <BatchTable
          startDate={startDate}
          endDate={endDate}
          branchIds={selectedBranches}
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
