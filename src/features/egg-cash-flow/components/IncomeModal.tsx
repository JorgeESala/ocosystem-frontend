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
import { formatDate } from "../utils/cashFlow.utils";
import type {
  CashFlowAccount,
  CollectionSuggestion,
} from "../types/eggCashFlow.types";

interface Props {
  open: boolean;
  onClose: () => void;
  collections: CollectionSuggestion[];
  initialPaymentId?: number | null;
  onSave: (payload: {
    date: string;
    amount: number;
    account: CashFlowAccount;
    paymentId?: number | null;
    description?: string | null;
    folio?: string | null;
    note?: string | null;
  }) => void;
  isSaving: boolean;
}

type Source = "payment" | "other";

const sourceAccount = (source: Source): CashFlowAccount =>
  source === "payment" ? "BANK" : "CASH";

export default function IncomeModal({
  open,
  onClose,
  collections,
  initialPaymentId,
  onSave,
  isSaving,
}: Props) {
  const [source, setSource] = useState<Source>("payment");
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState<CashFlowAccount>("BANK");
  const [paymentId, setPaymentId] = useState("");
  const [description, setDescription] = useState("");
  const [folio, setFolio] = useState("");
  const [note, setNote] = useState("");
  const appliedPrefill = useRef("");

  useEffect(() => {
    if (!open) return;
    appliedPrefill.current = "";
    setSource("payment");
    setDate(new Date());
    setAmount("");
    setAccount("BANK");
    setPaymentId("");
    setDescription("");
    setFolio("");
    setNote("");
  }, [open]);

  useEffect(() => {
    if (!open || initialPaymentId == null) return;
    const key = String(initialPaymentId);
    if (appliedPrefill.current === key) return;

    const col = collections.find((c) => c.paymentId === initialPaymentId);
    if (!col) return;
    setSource("payment");
    setPaymentId(String(initialPaymentId));
    setAmount(String(col.pending));
    setAccount("BANK");
    setDescription(`Cobro ${col.payerName ?? ""}`);
    appliedPrefill.current = key;
  }, [open, initialPaymentId, collections]);

  const pendingCollections = collections.filter((c) => c.pending > 0);

  const handleSourceChange = (value: string) => {
    const next = value as Source;
    setSource(next);
    setAccount(sourceAccount(next));
  };

  const handlePaymentChange = (value: string) => {
    setPaymentId(value);
    const col = collections.find((c) => String(c.paymentId) === value);
    if (col) {
      setAmount(String(col.pending));
      setAccount("BANK");
      setDescription(`Cobro ${col.payerName ?? ""}`);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const canSave = parsedAmount > 0;

  const handleSave = () => {
    onSave({
      date: toLocalDateString(date),
      amount: parsedAmount,
      account,
      paymentId: source === "payment" && paymentId ? Number(paymentId) : null,
      description: description.trim() || null,
      folio: folio.trim() || null,
      note: note.trim() || null,
    });
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Nuevo ingreso</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label htmlFor="incomeSource">Origen</Label>
            <Select
              id="incomeSource"
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
            >
              <option value="payment">
                Cobro pendiente (registrado en Contabilidad)
              </option>
              <option value="other">Otro ingreso</option>
            </Select>
          </div>

          {source === "payment" && (
            <div>
              <Label htmlFor="incomePayment">Cobro</Label>
              <Select
                id="incomePayment"
                value={paymentId}
                onChange={(e) => handlePaymentChange(e.target.value)}
              >
                <option value="">Seleccionar cobro...</option>
                {pendingCollections.map((c) => (
                  <option key={c.paymentId} value={c.paymentId}>
                    {formatDate(c.paymentDate)} — {c.payerName ?? "Sin nombre"}{" "}
                    ({formatMXN(c.pending)} pendiente)
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="incomeDestination">Destino</Label>
            <Select
              id="incomeDestination"
              value={account}
              onChange={(e) => setAccount(e.target.value as CashFlowAccount)}
            >
              <option value="BANK">Banco</option>
              <option value="CASH">Efectivo en oficina</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="incomeAmount">Monto (MXN)</Label>
            <TextInput
              id="incomeAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
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
            <Label htmlFor="incomeDescription">Concepto</Label>
            <TextInput
              id="incomeDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: ABONO FCP..."
            />
          </div>

          <div>
            <Label htmlFor="incomeFolio">Folio / referencia</Label>
            <TextInput
              id="incomeFolio"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="incomeNote">Nota</Label>
            <TextInput
              id="incomeNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving ? "Guardando..." : "Registrar ingreso"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
