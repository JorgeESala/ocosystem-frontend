import {
  Drawer,
  DrawerHeader,
  DrawerItems,
  Spinner,
  Badge,
  Button,
  Tooltip,
} from "flowbite-react";
import { useState } from "react";
import { HiArrowLeft, HiX } from "react-icons/hi";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import {
  useCancelPayment,
  useRecentPayments,
} from "@/features/accounting/api/payments.queries";
import type { PaymentResponse, PaymentMethod } from "../types/payment.types";

const methodLabels: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia",
  DEPOSIT: "Depósito",
  CHECK: "Cheque",
  OTHER: "Otro",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccessToast?: (message: string) => void;
}

export const RecentPaymentsDrawer = ({
  open,
  onClose,
  onSuccessToast,
}: Props) => {
  const { data = [], isLoading } = useRecentPayments(20);
  const cancelMutation = useCancelPayment();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleCancel = (p: PaymentResponse) => {
    cancelMutation.mutate(p.id, {
      onSuccess: () => {
        onSuccessToast?.(`Pago cancelado · ${formatMXN(p.amount)}`);
        setConfirmingId(null);
      },
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position="right"
      className="w-[500px]"
    >
      <DrawerHeader title="Pagos recientes" titleIcon={() => <></>} />

      <DrawerItems>
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {!isLoading && data.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay pagos recientes.
          </div>
        )}

        {!isLoading && data.length > 0 && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((p) => {
              const isActive = p.status === "ACTIVE";
              const isConfirming = confirmingId === p.id;
              return (
                <li
                  key={p.id}
                  className={`px-3 py-3 ${
                    isActive
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatHumanDate(p.paymentDate)}</span>
                        <span>·</span>
                        <span>{methodLabels[p.paymentMethod]}</span>
                        <span>·</span>
                        <span className="truncate">
                          {p.folio ? `Folio ${p.folio}` : "Sin folio"}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                        {p.payerName ?? "—"}
                        <span className="text-gray-400 dark:text-gray-500">
                          {" "}
                          →{" "}
                        </span>
                        {p.receiverName ?? "—"}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatMXN(p.amount)}
                        </span>
                        {isActive ? (
                          <Badge color="success">Activo</Badge>
                        ) : (
                          <Badge color="gray">Cancelado</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-start">
                      {isActive && !isConfirming && (
                        <Tooltip content="Cancelar pago">
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => setConfirmingId(p.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <HiArrowLeft className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                      {isActive && isConfirming && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            ¿Cancelar?
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => handleCancel(p)}
                              disabled={cancelMutation.isPending}
                            >
                              Sí
                            </Button>
                            <Button
                              size="xs"
                              color="gray"
                              onClick={() => setConfirmingId(null)}
                              disabled={cancelMutation.isPending}
                            >
                              <HiX className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DrawerItems>
    </Drawer>
  );
};

export default RecentPaymentsDrawer;
