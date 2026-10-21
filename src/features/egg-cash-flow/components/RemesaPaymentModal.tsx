import { useEffect, useRef, useState } from "react";
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
import { formatMXN } from "@/utils/moneyNumbers";
import type { Remesa } from "../types/eggCashFlow.types";

interface Props {
  open: boolean;
  onClose: () => void;
  remesas: Remesa[];
  accountHolder: string;
  initialApId?: number | null;
  onSave: (payload: {
    accountsPayableId: number;
    account: "CASH" | "BANK";
    date: string;
    amount: number;
    folio?: string | null;
    note?: string | null;
  }) => void;
  isSaving: boolean;
}

export default function RemesaPaymentModal({
  open,
  onClose,
  remesas,
  accountHolder,
  initialApId,
  onSave,
  isSaving,
}: Props) {
  const [apId, setApId] = useState("");
  const [account, setAccount] = useState<"BANK" | "CASH">("BANK");
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [folio, setFolio] = useState("");
  const [note, setNote] = useState("");
  const appliedPrefill = useRef(false);

  const selectRemesa = (value: string) => {
    setApId(value);
    const remesa = remesas.find((r) => String(r.accountsPayableId) === value);
    if (remesa) {
      setAmount(String(remesa.balance));
    }
  };

  useEffect(() => {
    if (!open) return;
    appliedPrefill.current = false;
    setApId("");
    setAccount("BANK");
    setDate(new Date());
    setAmount("");
    setFolio("");
    setNote("");
  }, [open]);

  useEffect(() => {
    if (!open || initialApId == null || appliedPrefill.current) return;
    const remesa = remesas.find((r) => r.accountsPayableId === initialApId);
    if (!remesa) return;
    setApId(String(initialApId));
    setAmount(String(remesa.balance));
    appliedPrefill.current = true;
  }, [open, initialApId, remesas]);

  const openRemesas = remesas.filter((r) => r.status !== "PAGADA");

  const handleRemesaChange = (value: string) => {
    selectRemesa(value);
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Pagar remesa · Deuda con {accountHolder}</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label>Remesa</Label>
            <Select
              value={apId}
              onChange={(e) => handleRemesaChange(e.target.value)}
            >
              <option value="">Seleccionar remesa...</option>
              {openRemesas.map((r) => (
                <option key={r.accountsPayableId} value={r.accountsPayableId}>
                  Remesa #{r.batchId} — {r.supplierName ?? "Proveedor"} (
                  {formatMXN(r.balance)} pendiente)
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Cuenta de salida</Label>
            <Select
              value={account}
              onChange={(e) => setAccount(e.target.value as "BANK" | "CASH")}
            >
              <option value="BANK">
                Caja general (cuenta de {accountHolder})
              </option>
              <option value="CASH">Caja chica (efectivo)</option>
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
            <Label htmlFor="remesaAmount">Monto a pagar (MXN)</Label>
            <TextInput
              id="remesaAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="remesaFolio">Folio / referencia</Label>
            <TextInput
              id="remesaFolio"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              placeholder="Ej: depósito a cuenta..."
            />
          </div>

          <div>
            <Label htmlFor="remesaNote">Nota</Label>
            <TextInput
              id="remesaNote"
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
                  accountsPayableId: Number(apId),
                  account,
                  date: toLocalDateString(date),
                  amount: parseFloat(amount) || 0,
                  folio: folio.trim() || null,
                  note: note.trim() || null,
                })
              }
              disabled={!apId || !amount || parseFloat(amount) <= 0 || isSaving}
            >
              {isSaving ? "Guardando..." : "Registrar pago"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
