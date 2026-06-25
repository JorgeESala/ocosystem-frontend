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

import { formatDateToISO, formatHumanDate } from "@/utils/date.utils";
import { useCreatePayment } from "@/features/accounting/api/payments.queries";
import { AccountingErrorAlert } from "@/features/accounting/components/AccountingErrorAlert";
import type { PaymentMethod } from "@/features/accounting/types/payment.types";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { formatMXN } from "@/utils/moneyNumbers";

const CONFIRMATION_THRESHOLD = 10_000;

interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse;
  onSuccessToast?: (message: string) => void;
}

type PendingConfirmation = {
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  folio: string;
  note: string;
};

export const RegisterBranchPaymentModal = ({
  open,
  onClose,
  account,
  onSuccessToast,
}: Props) => {
  const createPayment = useCreatePayment();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DEPOSIT");
  const [folio, setFolio] = useState("");
  const [note, setNote] = useState("");
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  useEffect(() => {
    if (open && account) {
      setPaymentDate(new Date());
      setFolio("");
      setNote("");
      setPaymentMethod("DEPOSIT");
      setAmount("");
      setPendingConfirmation(null);
    }
  }, [open, account]);

  if (!account) return null;

  const firePayment = (p: PendingConfirmation) => {
    createPayment.mutate(
      {
        accountsPaymentId: account.id,
        payerId: account.debtorId,
        receiverId: account.creditorId,
        amount: p.amount,
        paymentDate: formatDateToISO(p.paymentDate),
        paymentMethod: p.paymentMethod,
        folio: p.folio,
        note: p.note,
      },
      {
        onSuccess: (data) => {
          const folioPart = (data as { folio?: string })?.folio;
          const message = folioPart
            ? `Pago registrado · Folio ${folioPart} · ${formatMXN(p.amount)}`
            : `Pago registrado · ${formatMXN(p.amount)}`;
          onSuccessToast?.(message);
          onClose();
        },
      },
    );
  };

  const handleSubmit = () => {
    const value = Number(amount);
    if (!value || value <= 0 || !paymentDate) return;
    const payload: PendingConfirmation = {
      amount: value,
      paymentDate,
      paymentMethod,
      folio,
      note,
    };
    if (value > CONFIRMATION_THRESHOLD) {
      setPendingConfirmation(payload);
      return;
    }
    firePayment(payload);
  };

  const handleConfirm = () => {
    if (!pendingConfirmation) return;
    firePayment(pendingConfirmation);
  };

  const submitDisabled = createPayment.isPending;
  const value = Number(amount);
  const exceedsThreshold =
    Number.isFinite(value) && value > CONFIRMATION_THRESHOLD;

  return (
    <Modal show={open} onClose={onClose} size={pendingConfirmation ? "md" : "xl"}>
      <ModalHeader>Registrar pago</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {pendingConfirmation ? (
            <BranchConfirmationPanel
              pending={pendingConfirmation}
              branchAccount={account}
              onEdit={() => setPendingConfirmation(null)}
              onConfirm={handleConfirm}
              isSubmitting={submitDisabled}
            />
          ) : (
            <>
              <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <p className="mt-1">
                  Saldo pendiente: <strong>{formatMXN(account.balance)}</strong>
                </p>
              </div>

              {createPayment.isError && (
                <AccountingErrorAlert
                  error={createPayment.error}
                  title="No se pudo registrar el pago"
                />
              )}

              <div>
                <Label>Monto a pagar</Label>
                <TextInput
                  type="number"
                  value={amount}
                  min={0}
                  max={account.balance}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {exceedsThreshold && (
                  <p className="mt-1 text-xs text-amber-400">
                    Por seguridad, montos mayores a{" "}
                    {formatMXN(CONFIRMATION_THRESHOLD)} requieren confirmación.
                  </p>
                )}
              </div>

              <div>
                <Label>Fecha del pago</Label>
                <Datepicker
                  required
                  value={paymentDate ?? undefined}
                  onChange={(date) => setPaymentDate(date)}
                  language="es"
                />
              </div>

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
                  <option value="BANK_TRANSFER">Transferencia</option>
                  <option value="CHECK">Cheque</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </div>

              <details className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-200">
                  Más opciones (folio, notas)
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <Label>Folio / referencia (Sólo para depósito)</Label>
                    <TextInput
                      value={folio}
                      onChange={(e) => setFolio(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Notas (Opcional)</Label>
                    <Textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              </details>
            </>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        {pendingConfirmation ? (
          <>
            <Button color="gray" onClick={() => setPendingConfirmation(null)}>
              Editar
            </Button>
            <Button onClick={handleConfirm} disabled={submitDisabled}>
              Confirmar y registrar
            </Button>
          </>
        ) : (
          <>
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitDisabled}>
              Registrar pago
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

interface BranchConfirmationPanelProps {
  pending: PendingConfirmation;
  branchAccount: AccountsPayableResponse;
  onEdit: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const BranchConfirmationPanel = ({
  pending,
  branchAccount,
  onEdit,
  onConfirm,
  isSubmitting,
}: BranchConfirmationPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        <p className="font-medium">Confirma el pago antes de registrarlo</p>
        <p className="mt-1 text-xs">
          Estás a punto de registrar un pago por{" "}
          <strong>{formatMXN(pending.amount)}</strong>. Revisa los detalles
          antes de continuar.
        </p>
      </div>

      <dl className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white text-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex justify-between px-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Tipo</dt>
          <dd className="font-medium text-gray-800 dark:text-gray-100">Pago directo</dd>
        </div>
        <div className="flex justify-between px-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Monto</dt>
          <dd className="font-medium text-gray-800 dark:text-gray-100">
            {formatMXN(pending.amount)}
          </dd>
        </div>
        <div className="flex justify-between px-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Fecha</dt>
          <dd className="font-medium text-gray-800 dark:text-gray-100">
            {formatHumanDate(pending.paymentDate)}
          </dd>
        </div>
        <div className="flex justify-between px-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Cuenta</dt>
          <dd className="text-right text-gray-800 dark:text-gray-100">
            {branchAccount.debtorName} → {branchAccount.creditorName}
          </dd>
        </div>
        {pending.folio && (
          <div className="flex justify-between px-4 py-2">
            <dt className="text-gray-500 dark:text-gray-400">Folio</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">
              {pending.folio}
            </dd>
          </div>
        )}
      </dl>

      <div className="flex justify-end gap-2">
        <Button color="gray" onClick={onEdit} disabled={isSubmitting}>
          Editar
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          Confirmar y registrar
        </Button>
      </div>
    </div>
  );
};
