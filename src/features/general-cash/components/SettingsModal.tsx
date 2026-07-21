import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader, TextInput } from "flowbite-react";
import type { CashReserveResponseDTO, UpdateCashReserveDTO } from "@/features/general-cash/types";

interface Props {
  open: boolean;
  onClose: () => void;
  reserve: CashReserveResponseDTO | null;
  onSave: (id: number, payload: UpdateCashReserveDTO) => void;
  isSaving: boolean;
}

export default function SettingsModal({
  open,
  onClose,
  reserve,
  onSave,
  isSaving,
}: Props) {
  const [startingBalance, setStartingBalance] = useState("0");
  const [alertThreshold, setAlertThreshold] = useState("0");

  useEffect(() => {
    if (reserve) {
      setStartingBalance(reserve.startingBalance.toString());
      setAlertThreshold(reserve.alertThreshold.toString());
    }
  }, [reserve]);

  const handleSave = () => {
    if (!reserve) return;
    onSave(reserve.id, {
      startingBalance: parseFloat(startingBalance) || 0,
      alertThreshold: parseFloat(alertThreshold) || 0,
    });
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Configurar Caja - {reserve?.branchName}</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label htmlFor="startingBalance" className="mb-1 block text-sm font-medium text-slate-300">
              Saldo Inicial (MXN)
            </label>
            <TextInput
              id="startingBalance"
              type="number"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="alertThreshold" className="mb-1 block text-sm font-medium text-slate-300">
              Umbral de Alerta (MXN)
            </label>
            <TextInput
              id="alertThreshold"
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Se alertara cuando el saldo baje de este monto
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}