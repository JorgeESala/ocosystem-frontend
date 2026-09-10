import { Badge, Button, Spinner } from "flowbite-react";
import { useState } from "react";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import {
  useCancelPayment,
  usePairPayments,
  usePaymentApplications,
} from "../api/payments.queries";
import type {
  PaymentApplication,
  PaymentMethod,
  PaymentResponse,
} from "../types/payment.types";
import {
  isCancellablePayment,
  paymentSplit,
  summarizeCancelImpact,
} from "../utils/unappliedCredit";

const methodLabels: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia",
  DEPOSIT: "Depósito",
  CHECK: "Cheque",
  OTHER: "Otro",
};

interface Props {
  payerId?: number;
  receiverId?: number;
  partyLabel?: string;
  onSuccessToast?: (message: string) => void;
}

const applicationSourceLabel = (application: PaymentApplication): string => {
  if (application.sourceType === "BATCH" && application.sourceBatchId) {
    return `Remesa #${application.sourceBatchId}`;
  }
  if (application.sourceType === "DELIVERY" && application.sourceBatchId) {
    return `Venta #${application.sourceBatchId}`;
  }
  return "Sin documento origen";
};

const PaymentApplicationsBreakdown = ({ paymentId }: { paymentId: number }) => {
  const { data: applications = [], isLoading } =
    usePaymentApplications(paymentId);

  if (isLoading) {
    return (
      <div className="mt-2">
        <Spinner size="sm" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Sin deudas aplicadas; el monto quedó como saldo a favor.
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-1">
      {applications.map((application) => (
        <li
          key={application.accountsPayableId}
          className="text-xs text-gray-500 dark:text-gray-400"
        >
          {applicationSourceLabel(application)} ·{" "}
          {formatMXN(application.appliedAmount)}
        </li>
      ))}
    </ul>
  );
};

const CancelPaymentConfirm = ({
  payment,
  isSubmitting,
  onConfirm,
  onBack,
}: {
  payment: PaymentResponse;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) => {
  const { data: applications = [], isLoading } = usePaymentApplications(
    payment.id,
  );
  const impact = summarizeCancelImpact(applications);
  const folio = payment.folio ?? "sin folio";

  return (
    <div className="mt-2 rounded-md border border-red-300 bg-red-50 p-2 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
      <p className="font-medium">
        ¿Cancelar este pago? Esta acción revierte sus aplicaciones.
      </p>
      {isLoading ? (
        <Spinner size="sm" />
      ) : impact.debts > 0 ? (
        <p className="mt-1">
          Se reactivarán {impact.debts} deudas por {formatMXN(impact.total)}{" "}
          total · folio {folio}
        </p>
      ) : (
        <p className="mt-1">No hay deudas aplicadas · folio {folio}</p>
      )}
      <div className="mt-2 flex gap-2">
        <Button
          size="xs"
          color="failure"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          Sí, cancelar
        </Button>
        <Button size="xs" color="gray" onClick={onBack} disabled={isSubmitting}>
          Atrás
        </Button>
      </div>
    </div>
  );
};

export const AccountPaymentsList = ({
  payerId,
  receiverId,
  partyLabel,
  onSuccessToast,
}: Props) => {
  const { data: payments = [], isLoading } = usePairPayments(
    payerId,
    receiverId,
  );
  const cancelMutation = useCancelPayment();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Sin pagos registrados para {partyLabel ?? "esta cuenta"}.
      </p>
    );
  }

  const handleCancel = (payment: PaymentResponse) => {
    cancelMutation.mutate(payment.id, {
      onSuccess: () => {
        onSuccessToast?.(`Pago cancelado · ${formatMXN(payment.amount)}`);
        setConfirmingId(null);
      },
    });
  };

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {payments.map((payment) => {
        const isActive = payment.status === "ACTIVE";
        const { applied, parked } = paymentSplit(payment);
        const expanded = expandedId === payment.id;
        const confirming = confirmingId === payment.id;

        return (
          <li key={payment.id} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatHumanDate(payment.paymentDate)}</span>
                  <span>·</span>
                  <span>{methodLabels[payment.paymentMethod]}</span>
                  <span>·</span>
                  <span>
                    {payment.folio ? `Folio ${payment.folio}` : "Sin folio"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {isActive ? (
                    <Badge color="success">Activo</Badge>
                  ) : (
                    <Badge color="gray">Cancelado</Badge>
                  )}
                  {isActive && parked > 0 && (
                    <Badge color="warning">
                      Saldo a favor {formatMXN(parked)}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Aplicado {formatMXN(applied)} · Saldo a favor{" "}
                  {formatMXN(parked)}
                </p>
                {expanded && (
                  <PaymentApplicationsBreakdown paymentId={payment.id} />
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => setExpandedId(expanded ? null : payment.id)}
                >
                  {expanded ? "Ocultar desglose" : "Ver desglose"}
                </Button>
                {isCancellablePayment(payment) && !confirming && (
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => setConfirmingId(payment.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Cancelar pago
                  </Button>
                )}
              </div>
            </div>
            {confirming && (
              <CancelPaymentConfirm
                payment={payment}
                isSubmitting={cancelMutation.isPending}
                onConfirm={() => handleCancel(payment)}
                onBack={() => setConfirmingId(null)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default AccountPaymentsList;
