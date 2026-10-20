import { useEffect, useState } from "react";
import {
  Button,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import { toLocalDateString } from "../utils/cashFlow.utils";

interface Props {
  open: boolean;
  onClose: () => void;
  cashBalance: number;
  onSave: (payload: {
    date: string;
    amount: number;
    folio?: string | null;
    note?: string | null;
  }) => void;
  isSaving: boolean;
}

export default function DepositModal({
  open,
  onClose,
  cashBalance,
  onSave,
  isSaving,
}: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [folio, setFolio] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setDate(new Date());
      setAmount(cashBalance > 0 ? String(cashBalance) : "");
      setFolio("");
      setNote("");
    }
  }, [open, cashBalance]);

  const canSave = Boolean(amount && parseFloat(amount) > 0);

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Ingreso a cuenta · Depósito</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-700/50 px-4 py-3">
            <div className="text-xs text-slate-400">
              Efectivo disponible en caja chica
            </div>
            <div className="text-xl font-bold text-white">
              $
              {cashBalance.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <Label>Fecha</Label>
            <Datepicker
              language="es-MX"
              value={date}
              onChange={(d) => d && setDate(d)}
            />
          </div>

          <div>
            <Label htmlFor="depositAmount">Monto a depositar (MXN)</Label>
            <TextInput
              id="depositAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="depositFolio">Folio / referencia</Label>
            <TextInput
              id="depositFolio"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              placeholder="Ej: depósito bancomer..."
            />
          </div>

          <div>
            <Label htmlFor="depositNote">Nota</Label>
            <TextInput
              id="depositNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                onSave({
                  date: toLocalDateString(date),
                  amount: parseFloat(amount) || 0,
                  folio: folio.trim() || null,
                  note: note.trim() || null,
                })
              }
              disabled={!canSave || isSaving}
            >
              {isSaving ? "Guardando..." : "Registrar depósito"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
