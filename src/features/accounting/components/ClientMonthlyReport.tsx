import { Badge, Button, Spinner } from "flowbite-react";
import { useMemo, useState } from "react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDateToISO, formatHumanDate } from "@/utils/date.utils";
import DateRangePicker from "@/components/DateRangePicker";
import { useClientStatementSummary } from "../api/client-summary.queries";
import {
  useCancelPayment,
  usePaymentApplications,
} from "../api/payments.queries";
import type { ClientMonthlyReportPdfInput } from "../api/client-summary.api";
import { summarizeCancelImpact } from "../utils/unappliedCredit";
import { InfoTip } from "./InfoTip";
import {
  CargosHelpContent,
  PagosHelpContent,
  SaldoFinalHelpContent,
  SaldoInicialHelpContent,
} from "./AccountingHelpContent";
import { AccountingErrorAlert } from "./AccountingErrorAlert";
import { statementRowLabel } from "../utils/openAccounts";

interface Props {
  debtorEntityId: number;
  debtorName: string;
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
  creditorNames: Map<number, string>;
  onExportPdf?: (input: ClientMonthlyReportPdfInput) => void;
  onSuccessToast?: (message: string) => void;
}

const toDate = (iso: string): Date | null => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const monthBounds = (offset: number): { from: string; to: string } => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { from: formatDateToISO(first), to: formatDateToISO(last) };
};

export const ClientMonthlyReport = ({
  debtorEntityId,
  debtorName,
  from,
  to,
  onRangeChange,
  creditorNames,
  onExportPdf,
  onSuccessToast,
}: Props) => {
  const start = useMemo(() => toDate(from), [from]);
  const end = useMemo(() => toDate(to), [to]);
  const validRange = start != null && end != null && start <= end;
  const cancelPayment = useCancelPayment();
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<number | null>(
    null,
  );

  const { data, isLoading, isError, error, refetch } =
    useClientStatementSummary({
      debtorEntityId,
      from,
      to,
      enabled: validRange,
    });

  const handlePickerChange = (nextStart: Date | null, nextEnd: Date | null) => {
    if (nextStart && nextEnd) {
      onRangeChange(formatDateToISO(nextStart), formatDateToISO(nextEnd));
    }
  };

  const applyPreset = (offset: number) => {
    const bounds = monthBounds(offset);
    onRangeChange(bounds.from, bounds.to);
  };

  const handleCancel = (paymentId: number, folio?: string | null) => {
    cancelPayment.mutate(paymentId, {
      onSuccess: () => {
        onSuccessToast?.(`Pago cancelado · folio ${folio ?? "sin folio"}`);
        setConfirmingPaymentId(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-2">
          <DateRangePicker
            key={`${from}-${to}`}
            startDate={start}
            endDate={end}
            onChange={handlePickerChange}
          />
          <div className="flex gap-2">
            <Button size="xs" color="gray" onClick={() => applyPreset(0)}>
              Este mes
            </Button>
            <Button size="xs" color="gray" onClick={() => applyPreset(-1)}>
              Mes pasado
            </Button>
          </div>
          {start && end && (
            <p className="text-xs text-gray-400">
              Del {formatHumanDate(from, "short")} al{" "}
              {formatHumanDate(to, "short")}
            </p>
          )}
        </div>
        {data && onExportPdf && (
          <Button
            size="xs"
            color="gray"
            onClick={() =>
              onExportPdf({
                debtorName,
                from: data.from,
                to: data.to,
                openingBalance: data.openingBalance,
                totalCharges: data.totalCharges,
                totalPayments: data.totalPayments,
                closingBalance: data.closingBalance,
                movements: data.movements.map((m) => ({
                  movementDate: m.movementDate,
                  creditorName:
                    creditorNames.get(m.creditorEntityId) ??
                    `Entidad ${m.creditorEntityId}`,
                  movementType: m.movementType,
                  amount: m.amount,
                  balanceAfter: m.balanceAfter,
                  folio: m.folio,
                  note: m.note,
                })),
              })
            }
          >
            Exportar PDF
          </Button>
        )}
      </div>

      {!validRange ? (
        <p className="text-sm text-yellow-300">
          Elige una fecha de inicio anterior o igual a la fecha de fin.
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : isError ? (
        <AccountingErrorAlert error={error} onRetry={() => refetch()} />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-wider text-gray-400 uppercase">
                Saldo inicial
                <InfoTip title="Saldo inicial" align="left">
                  <SaldoInicialHelpContent />
                </InfoTip>
              </p>
              <p className="text-lg font-bold text-white">
                {formatMXN(data.openingBalance)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-wider text-gray-400 uppercase">
                Saldo final
                <InfoTip title="Saldo final" align="right">
                  <SaldoFinalHelpContent />
                </InfoTip>
              </p>
              <p className="text-lg font-bold text-white">
                {formatMXN(data.closingBalance)}
              </p>
            </div>
            <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-wider text-red-300 uppercase">
                Cargos
                <InfoTip title="Cargos" align="left">
                  <CargosHelpContent />
                </InfoTip>
              </p>
              <p className="text-lg font-bold text-white">
                {formatMXN(data.totalCharges)}
              </p>
            </div>
            <div className="rounded-lg border border-green-900/40 bg-green-950/20 p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-wider text-green-300 uppercase">
                Pagos
                <InfoTip title="Pagos" align="right">
                  <PagosHelpContent />
                </InfoTip>
              </p>
              <p className="text-lg font-bold text-white">
                {formatMXN(data.totalPayments)}
              </p>
            </div>
          </div>

          {data.movements.length === 0 ? (
            <p className="text-sm text-gray-400">
              Sin movimientos para {debtorName} en el rango elegido.
            </p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {[...data.movements].reverse().map((m, idx) => {
                const isPayment =
                  m.movementType === "PAYMENT" && m.paymentId != null;
                const isActivePayment =
                  isPayment && m.paymentStatus === "ACTIVE";
                const confirming =
                  isPayment && confirmingPaymentId === m.paymentId;

                return (
                  <li
                    key={`${m.movementDate}-${m.amount}-${idx}`}
                    className="py-2 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge color="gray">
                            {statementRowLabel(m.movementType)}
                          </Badge>
                          <span className="text-[11px] text-gray-400">
                            {creditorNames.get(m.creditorEntityId) ??
                              `Entidad ${m.creditorEntityId}`}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {formatHumanDate(m.movementDate)}
                          {m.folio ? ` · ${m.folio}` : ""}
                          {m.balanceAfter != null
                            ? ` · saldo ${formatMXN(m.balanceAfter)}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-semibold text-white">
                          {formatMXN(m.amount)}
                        </span>
                        {isActivePayment && !confirming && (
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() =>
                              setConfirmingPaymentId(m.paymentId ?? null)
                            }
                            disabled={cancelPayment.isPending}
                          >
                            Cancelar pago
                          </Button>
                        )}
                        {isPayment && m.paymentStatus === "CANCELLED" && (
                          <Badge color="gray">Cancelado</Badge>
                        )}
                      </div>
                    </div>
                    {confirming && m.paymentId != null && (
                      <ReportPaymentCancel
                        paymentId={m.paymentId}
                        folio={m.folio}
                        isSubmitting={cancelPayment.isPending}
                        onConfirm={() => handleCancel(m.paymentId!, m.folio)}
                        onBack={() => setConfirmingPaymentId(null)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

interface ReportPaymentCancelProps {
  paymentId: number;
  folio?: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

const ReportPaymentCancel = ({
  paymentId,
  folio,
  isSubmitting,
  onConfirm,
  onBack,
}: ReportPaymentCancelProps) => {
  const { data: applications = [], isLoading } =
    usePaymentApplications(paymentId);
  const impact = summarizeCancelImpact(applications);

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
          total · folio {folio ?? "sin folio"}
        </p>
      ) : (
        <p className="mt-1">
          No hay deudas aplicadas · folio {folio ?? "sin folio"}
        </p>
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
