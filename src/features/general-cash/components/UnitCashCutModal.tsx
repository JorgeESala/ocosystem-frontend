import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Datepicker,
  Select,
} from "flowbite-react";
import { useEmployees } from "@/features/employee/api/employees.queries";
import type { CreateUnitCashCutDTO, UnitCashAccountDTO } from "../types.unit";

interface Props {
  open: boolean;
  onClose: () => void;
  account: UnitCashAccountDTO | null;
  onSave: (payload: CreateUnitCashCutDTO) => void;
  isSaving: boolean;
}

export default function UnitCashCutModal({
  open,
  onClose,
  account,
  onSave,
  isSaving,
}: Props) {
  const { data: employees = [] } = useEmployees();

  const [cutDate, setCutDate] = useState<Date>(new Date());
  const [handedOverBy, setHandedOverBy] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [alertThreshold, setAlertThreshold] = useState("0");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setCutDate(new Date());
      setHandedOverBy("");
      setReceivedBy("");
      setOpeningBalance("0");
      setAlertThreshold("0");
      setNote("");
    }
  }, [open]);

  const canSave = Boolean(handedOverBy && receivedBy) && !isSaving;

  const handleSave = () => {
    onSave({
      cutDate: cutDate.toISOString().split("T")[0],
      openingBalance: parseFloat(openingBalance) || 0,
      alertThreshold: parseFloat(alertThreshold) || 0,
      note: note.trim() ? note.trim() : null,
      handedOverBy: parseInt(handedOverBy, 10),
      receivedBy: parseInt(receivedBy, 10),
    });
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Corte de caja</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-700/50 px-4 py-3">
            <div className="text-xs text-slate-400">Saldo actual (cierre)</div>
            <div className="text-xl font-bold text-white">
              $
              {(account?.currentBalance ?? 0).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Fecha
            </label>
            <Datepicker
              language="es-MX"
              value={cutDate}
              onChange={(d) => d && setCutDate(d)}
            />
          </div>

          <div>
            <label
              htmlFor="unitCashCutHandedOver"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Entregado por
            </label>
            <Select
              id="unitCashCutHandedOver"
              value={handedOverBy}
              onChange={(e) => setHandedOverBy(e.target.value)}
            >
              <option value="">Seleccionar empleado...</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label
              htmlFor="unitCashCutReceivedBy"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Recibido por
            </label>
            <Select
              id="unitCashCutReceivedBy"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
            >
              <option value="">Seleccionar empleado...</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label
              htmlFor="unitCashCutOpeningBalance"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Saldo inicial del nuevo periodo (MXN)
            </label>
            <input
              id="unitCashCutOpeningBalance"
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="unitCashCutAlertThreshold"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Umbral de Alerta (MXN)
            </label>
            <input
              id="unitCashCutAlertThreshold"
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="unitCashCutNote"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Nota
            </label>
            <input
              id="unitCashCutNote"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Entrega a nuevo responsable"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button color="warning" onClick={handleSave} disabled={!canSave}>
              {isSaving ? "Guardando..." : "Corte de caja"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
