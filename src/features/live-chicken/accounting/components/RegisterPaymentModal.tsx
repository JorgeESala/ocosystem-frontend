import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  TextInput,
  Select,
  Textarea,
} from "flowbite-react";
import { useState, useEffect } from "react";
import type { AccountsPayableResponse } from "../accounts-payable/types";
import { useCreatePayment } from "../payments/api/payments.queries";
import type { PaymentMethod } from "../payments/types";

interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse;
}

export const RegisterPaymentModal = ({ open, onClose, account }: Props) => {
  const createPayment = useCreatePayment();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [folio, setFolio] = useState("");
  const [notes, setNotes] = useState("");

  // reset when opening
  useEffect(() => {
    if (open && account) {
      setAmount(account.balance.toString());
      setPaymentDate(new Date().toISOString().substring(0, 10));
      setFolio("");
      setNotes("");
      setPaymentMethod("TRANSFER");
    }
  }, [open, account]);

  if (!account) return null;

  const handleSubmit = () => {
    const value = Number(amount);
    if (!value || value <= 0) return;

    createPayment.mutate(
      {
        payerId: account.debtorId,
        receiverId: account.creditorId,

        amount: value,
        paymentDate,
        paymentMethod,
        folio,
        notes,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Registrar pago</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {/* Context */}
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <p className="mt-1">
              Saldo pendiente: <strong>${account.balance.toFixed(2)}</strong>
            </p>
          </div>

          {/* Amount */}
          <div>
            <Label>Monto a pagar</Label>
            <TextInput
              type="number"
              value={amount}
              min={0}
              max={account.balance}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Date */}
          <div>
            <Label>Fecha del pago</Label>
            <TextInput
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          {/* Method */}
          <div>
            <Label>Método de pago</Label>
            <Select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
            >
              <option value="TRANSFER">Transferencia</option>
              <option value="DEPOSIT">Depósito</option>
              <option value="CASH">Efectivo</option>
              <option value="CHECK">Cheque</option>
            </Select>
          </div>

          {/* Folio */}
          <div>
            <Label>Folio / referencia</Label>
            <TextInput
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notas (opcional)</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={createPayment.isPending}>
          Registrar pago
        </Button>
      </ModalFooter>
    </Modal>
  );
};
