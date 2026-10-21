import { useEffect, useState } from "react";
import {
  Button,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  TextInput,
} from "flowbite-react";
import { toLocalDateString } from "@/utils/date.utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payload: {
    account: "CASH" | "BANK";
    direction: "IN" | "OUT";
    date: string;
    amount: number;
    reason: string;
    note?: string | null;
  }) => void;
  isSaving: boolean;
}

export default function AdjustmentModal({
  open,
  onClose,
  onSave,
  isSaving,
}: Props) {
  const [account, setAccount] = useState<"CASH" | "BANK">("BANK");
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setAccount("BANK");
      setDirection("IN");
      setDate(new Date());
      setAmount("");
      setReason("");
      setNote("");
    }
  }, [open]);

  const canSave = Boolean(amount && parseFloat(amount) > 0 && reason.trim());

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Nuevo ajuste</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label>Cuenta</Label>
            <Select
              value={account}
              onChange={(e) => setAccount(e.target.value as "CASH" | "BANK")}
            >
              <option value="BANK">Caja general</option>
              <option value="CASH">Caja chica</option>
            </Select>
          </div>

          <div>
            <Label>Tipo de ajuste</Label>
            <Select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "IN" | "OUT")}
            >
              <option value="IN">Suma (+)</option>
              <option value="OUT">Resta (−)</option>
            </Select>
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
            <Label htmlFor="adjustmentAmount">Monto (MXN)</Label>
            <TextInput
              id="adjustmentAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="adjustmentReason">Motivo</Label>
            <TextInput
              id="adjustmentReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Faltante, diferencia bancaria..."
            />
          </div>

          <div>
            <Label htmlFor="adjustmentNote">Nota</Label>
            <TextInput
              id="adjustmentNote"
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
                  account,
                  direction,
                  date: toLocalDateString(date),
                  amount: parseFloat(amount) || 0,
                  reason: reason.trim(),
                  note: note.trim() || null,
                })
              }
              disabled={!canSave || isSaving}
            >
              {isSaving ? "Guardando..." : "Registrar ajuste"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
