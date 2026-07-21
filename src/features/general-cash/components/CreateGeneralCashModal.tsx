import { useState } from "react";
import { Button, Modal, ModalBody, ModalHeader, Select } from "flowbite-react";
import type { CreateCashReserveDTO } from "@/features/general-cash/types";
import type { Branch } from "@/features/branches/branch/types";

interface Props {
  open: boolean;
  onClose: () => void;
  branches: Branch[];
  existingBranchIds: number[];
  onSave: (payload: CreateCashReserveDTO) => void;
  isSaving: boolean;
}

export default function CreateGeneralCashModal({
  open,
  onClose,
  branches,
  existingBranchIds,
  onSave,
  isSaving,
}: Props) {
  const [branchId, setBranchId] = useState<string>("");
  const [startingBalance, setStartingBalance] = useState("0");
  const [alertThreshold, setAlertThreshold] = useState("0");

  const availableBranches = branches.filter(
    (b) => !existingBranchIds.includes(b.id),
  );

  const handleSave = () => {
    if (!branchId) return;
    onSave({
      branchId: parseInt(branchId, 10),
      startingBalance: parseFloat(startingBalance) || 0,
      alertThreshold: parseFloat(alertThreshold) || 0,
    });
  };

  const handleClose = () => {
    setBranchId("");
    setStartingBalance("0");
    setAlertThreshold("0");
    onClose();
  };

  return (
    <Modal show={open} onClose={handleClose} size="md" popup>
      <ModalHeader>Nueva Caja</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label htmlFor="branch" className="mb-1 block text-sm font-medium text-slate-300">
              Sucursal
            </label>
            <Select
              id="branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            >
              <option value="">Seleccionar sucursal...</option>
              {availableBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
            {availableBranches.length === 0 && (
              <p className="mt-1 text-xs text-amber-400">
                Todas las sucursales ya tienen caja asignada
              </p>
            )}
          </div>
          <div>
            <label htmlFor="startingBalance" className="mb-1 block text-sm font-medium text-slate-300">
              Saldo Inicial (MXN)
            </label>
            <input
              id="startingBalance"
              type="number"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="alertThreshold" className="mb-1 block text-sm font-medium text-slate-300">
              Umbral de Alerta (MXN)
            </label>
            <input
              id="alertThreshold"
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
            <Button onClick={handleSave} disabled={isSaving || !branchId}>
              {isSaving ? "Creando..." : "Crear Caja"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}