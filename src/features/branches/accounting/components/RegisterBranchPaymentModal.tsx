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
  Datepicker,
} from "flowbite-react";
import { useState, useEffect } from "react";

import { formatDateToISO } from "@/utils/date.utils";
import { useCreatePayment } from "@/features/accounting/api/payments.queries";
import type { PaymentMethod } from "@/features/accounting/types/payment.types";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { formatMXN } from "@/utils/moneyNumbers";
interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse;
}

export const RegisterBranchPaymentModal = ({
  open,
  onClose,
  account,
}: Props) => {
  type PaymentKind = "NORMAL";

  const createPayment = useCreatePayment();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DEPOSIT");
  const [folio, setFolio] = useState("");
  const [note, setNote] = useState("");
  const [driverId, setDriverId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [paymentKind, setPaymentKind] = useState<PaymentKind>("NORMAL");

  // const DEFAULT_CEDIS_ID = 3;

  // reset when opening
  useEffect(() => {
    if (open && account) {
      setPaymentKind("NORMAL");
      setPaymentDate(new Date());
      setFolio("");
      setNote("");
      setPaymentMethod("DEPOSIT");
      setAmount("");
      setDriverId("");
      setRouteId("");
    }
  }, [open, account]);

  if (!account) return null;

  const handleSubmit = () => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    if (!paymentDate) return;
    if (paymentKind === "NORMAL") {
      createPayment.mutate(
        {
          accountsPaymentId: account.id,
          payerId: account.debtorId,
          receiverId: account.creditorId,

          amount: value,
          paymentDate: formatDateToISO(paymentDate),
          paymentMethod,
          folio,
          note,
          driverId: driverId ? Number(driverId) : undefined,
          routeId: routeId ? Number(routeId) : undefined,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    }
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Registrar pago</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {/* Context */}
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <p className="mt-1">
              Saldo pendiente: <strong>{formatMXN(account.balance)}</strong>
            </p>
          </div>

          {/* Normal payment (no compensation) */}
          {paymentKind === "NORMAL" && (
            <>
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
                <Datepicker
                  required
                  value={paymentDate ?? undefined}
                  onChange={(date) => setPaymentDate(date)}
                  language="es"
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
                  <option value="DEPOSIT">Depósito</option>
                  <option value="CASH">Efectivo</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="CHECK">Cheque</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </div>

              {/* Folio */}
              <div>
                <Label>Folio / referencia (Sólo para depósito)</Label>
                <TextInput
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div>
                <Label>Notas (Opcional)</Label>
                <Textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}
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
