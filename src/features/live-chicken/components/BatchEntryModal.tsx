import { useState, useEffect } from "react";
import { Modal, ModalBody, ModalHeader, Select } from "flowbite-react";

import InboundBatchSaleEntryForm from "./InboundBatchSaleEntryForm";
import ChickenLossEntryForm from "../ChickenLoss/components/ChickenLossEntryForm";

import type { BatchEntryModalProps } from "../ChickenLoss/types/chickenLoss.types";

export default function BatchEntryModal({
  batch,
  type,
  mode,
  saleToEdit,
  lossToEdit,
  onClose,
  onSuccess,
}: BatchEntryModalProps) {
  const [entryType, setEntryType] = useState(type);

  useEffect(() => {
    setEntryType(type);
  }, [type]);

  return (
    <Modal show onClose={onClose} size="md">
      <ModalHeader>
        {mode === "edit" ? "Editar" : "Nueva"}{" "}
        {entryType === "SALE" ? "venta" : "baja"} – Remesa #{batch.id}
      </ModalHeader>

      <ModalBody className="space-y-4">
        {/* Selector SOLO en CREATE */}
        {mode === "create" && (
          <Select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value as "SALE" | "LOSS")}
          >
            <option value="SALE">Venta</option>
            <option value="LOSS">Baja</option>
          </Select>
        )}

        {entryType === "SALE" ? (
          <InboundBatchSaleEntryForm
            batch={batch}
            existingSale={mode === "edit" ? saleToEdit : undefined}
            onSuccess={onSuccess}
          />
        ) : (
          <ChickenLossEntryForm
            batch={batch}
            initialData={mode === "edit" ? lossToEdit : undefined}
            onSuccess={onSuccess}
          />
        )}
      </ModalBody>
    </Modal>
  );
}
