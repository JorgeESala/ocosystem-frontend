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
import { formatMXN } from "@/utils/moneyNumbers";
import AccountingErrorAlert from "@/features/accounting/components/AccountingErrorAlert";
import { formatDate } from "../utils/cashFlow.utils";
import type { AvailableExpense } from "../types/eggCashFlow.types";

interface Props {
  open: boolean;
  onClose: () => void;
  expenses: AvailableExpense[];
  error?: unknown;
  onRetryExpenses?: () => void;
  onSave: (payload: {
    expenseId: number;
    date?: string | null;
    amount?: number | null;
    note?: string | null;
  }) => void;
  isSaving: boolean;
}

export default function CashExpenseModal({
  open,
  onClose,
  expenses,
  error,
  onRetryExpenses,
  onSave,
  isSaving,
}: Props) {
  const [expenseId, setExpenseId] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setExpenseId("");
      setDate(new Date());
      setAmount("");
      setNote("");
    }
  }, [open]);

  const available = expenses.filter((e) => !e.linked);

  const handleExpenseChange = (value: string) => {
    setExpenseId(value);
    const exp = expenses.find((e) => String(e.id) === value);
    if (exp) {
      setAmount(String(exp.amount));
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Gasto en efectivo · Efectivo en oficina</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label>Gasto existente (de la sección Gastos)</Label>
            <Select
              value={expenseId}
              onChange={(e) => handleExpenseChange(e.target.value)}
            >
              <option value="">Seleccionar gasto...</option>
              {available.map((e) => (
                <option key={e.id} value={e.id}>
                  {formatDate(e.date)} — {e.reason ?? e.categoryName} (
                  {formatMXN(e.amount)})
                </option>
              ))}
            </Select>
            {error != null ? (
              <div className="mt-1">
                <AccountingErrorAlert
                  error={error}
                  title="No se pudieron cargar los gastos"
                  onRetry={onRetryExpenses}
                />
              </div>
            ) : (
              available.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  No hay gastos disponibles para vincular. Registra un gasto
                  primero en la sección Gastos.
                </p>
              )
            )}
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
            <Label htmlFor="cashExpenseAmount">Monto (MXN)</Label>
            <TextInput
              id="cashExpenseAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="cashExpenseNote">Nota</Label>
            <TextInput
              id="cashExpenseNote"
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
                  expenseId: Number(expenseId),
                  date: toLocalDateString(date),
                  amount: parseFloat(amount) || null,
                  note: note.trim() || null,
                })
              }
              disabled={!expenseId || isSaving}
            >
              {isSaving ? "Guardando..." : "Registrar gasto"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
