import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Datepicker,
} from "flowbite-react";
import type {
  CreateUnitCashAdjustmentDTO,
  UnitCashAdjustmentDTO,
  UpdateUnitCashAdjustmentDTO,
} from "../types.unit";

interface Props {
  open: boolean;
  onClose: () => void;
  unitLabel: string;
  adjustment?: UnitCashAdjustmentDTO | null;
  onSave: (
    payload:
      | CreateUnitCashAdjustmentDTO
      | { id: number; payload: UpdateUnitCashAdjustmentDTO },
  ) => void;
  isSaving: boolean;
}

export default function UnitCashAdjustmentModal({
  open,
  onClose,
  unitLabel,
  adjustment,
  onSave,
  isSaving,
}: Props) {
  const isEditing = Boolean(adjustment);

  const [amount, setAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    if (adjustment) {
      setAmount(adjustment.amount.toString());
      setReason(adjustment.reason);
      setDate(new Date(adjustment.date + "T00:00:00"));
    } else {
      setAmount("0");
      setReason("");
      setDate(new Date());
    }
  }, [adjustment, open]);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount) || 0;
    const dateStr = date.toISOString().split("T")[0];

    if (isEditing && adjustment) {
      onSave({
        id: adjustment.id,
        payload: { amount: parsedAmount, reason, date: dateStr },
      });
    } else {
      onSave({ amount: parsedAmount, reason, date: dateStr });
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>
        {isEditing ? "Editar Ajuste" : "Nuevo Ajuste"} - {unitLabel}
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="unitCashAdjustmentAmount"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Monto (MXN)
            </label>
            <input
              id="unitCashAdjustmentAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Positivo = suma, Negativo = resta"
            />
            <p className="mt-1 text-xs text-slate-500">
              Usa positivo para sumar, negativo para restar
            </p>
          </div>

          <div>
            <label
              htmlFor="unitCashAdjustmentReason"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Razon
            </label>
            <input
              id="unitCashAdjustmentReason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Faltante en cuenta recibida"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Fecha
            </label>
            <Datepicker
              language="es-MX"
              value={date}
              onChange={(d) => d && setDate(d)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !reason}>
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Actualizar"
                  : "Crear Ajuste"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
