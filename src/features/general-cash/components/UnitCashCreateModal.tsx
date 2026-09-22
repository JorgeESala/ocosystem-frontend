import { useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import type { CreateUnitCashDTO } from "../types.unit";

interface Props {
  open: boolean;
  onClose: () => void;
  unitLabel: string;
  onSave: (payload: CreateUnitCashDTO) => void;
  isSaving: boolean;
}

export default function UnitCashCreateModal({
  open,
  onClose,
  unitLabel,
  onSave,
  isSaving,
}: Props) {
  const [startingBalance, setStartingBalance] = useState("0");
  const [alertThreshold, setAlertThreshold] = useState("0");

  const handleClose = () => {
    setStartingBalance("0");
    setAlertThreshold("0");
    onClose();
  };

  const handleSave = () => {
    onSave({
      startingBalance: parseFloat(startingBalance) || 0,
      alertThreshold: parseFloat(alertThreshold) || 0,
    });
  };

  return (
    <Modal show={open} onClose={handleClose} size="md" popup>
      <ModalHeader>Nueva Caja General - {unitLabel}</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="unitCashStartingBalance"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Saldo Inicial (MXN)
            </label>
            <input
              id="unitCashStartingBalance"
              type="number"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="unitCashAlertThreshold"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Umbral de Alerta (MXN)
            </label>
            <input
              id="unitCashAlertThreshold"
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Se alertara cuando el saldo baje de este monto
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Creando..." : "Crear Caja"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
