import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import type { UnitCashAccountDTO, UpdateUnitCashDTO } from "../types.unit";
import {
  resolveEmployeeName,
  useEmployeeNames,
} from "@/features/general-cash/utils/employeeNames";

interface Props {
  open: boolean;
  onClose: () => void;
  account: UnitCashAccountDTO | null;
  onSave: (payload: UpdateUnitCashDTO) => void;
  onRecalculate: () => void;
  isSaving: boolean;
  isRecalculating: boolean;
}

export default function UnitCashSettingsModal({
  open,
  onClose,
  account,
  onSave,
  onRecalculate,
  isSaving,
  isRecalculating,
}: Props) {
  const [startingBalance, setStartingBalance] = useState("0");
  const [alertThreshold, setAlertThreshold] = useState("0");
  const employeeNames = useEmployeeNames();

  useEffect(() => {
    if (account) {
      setStartingBalance(account.startingBalance.toString());
      setAlertThreshold(account.alertThreshold.toString());
    }
  }, [account, open]);

  const handleSave = () => {
    onSave({
      startingBalance: parseFloat(startingBalance) || 0,
      alertThreshold: parseFloat(alertThreshold) || 0,
    });
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Configurar Caja General</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {account?.updatedBy != null && (
            <p className="text-xs text-slate-500">
              Ultima modificacion:{" "}
              {resolveEmployeeName(employeeNames, account.updatedBy)}
            </p>
          )}
          {account?.trackingStartDate && (
            <p className="text-xs text-slate-500">
              Movimientos registrados desde:{" "}
              {new Date(
                account.trackingStartDate + "T00:00:00",
              ).toLocaleDateString("es-MX")}
            </p>
          )}
          <div>
            <label
              htmlFor="unitCashSettingsStartingBalance"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Saldo Inicial (MXN)
            </label>
            <input
              id="unitCashSettingsStartingBalance"
              type="number"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Al guardar, el saldo actual se recalcula desde el historial.
            </p>
          </div>
          <div>
            <label
              htmlFor="unitCashSettingsAlertThreshold"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Umbral de Alerta (MXN)
            </label>
            <input
              id="unitCashSettingsAlertThreshold"
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              color="light"
              onClick={onRecalculate}
              disabled={isRecalculating}
            >
              {isRecalculating ? "Recalculando..." : "Recalcular saldo"}
            </Button>
            <div className="flex gap-2">
              <Button color="gray" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
