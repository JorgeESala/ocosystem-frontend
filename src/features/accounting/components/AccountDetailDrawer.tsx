import {
  Badge,
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { HiArrowLeft, HiDocumentDownload } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDateToISO, formatHumanDate } from "@/utils/date.utils";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import {
  statementRowLabel,
  type StatementMovementRow,
} from "../utils/openAccounts";
import { isReversibleMovement, totalUnapplied } from "../utils/unappliedCredit";
import type { ClientMonthlyReportPdfInput } from "../api/client-summary.api";
import { useAccountingEntities } from "../api/accounting-entities.queries";
import { useAccountsPayableMovements } from "../api/movements.queries";
import {
  useApplyRemainder,
  useRecentPayments,
  useReverseApplication,
  useUnappliedPayments,
} from "../api/payments.queries";
import { AccountingErrorAlert } from "./AccountingErrorAlert";
import { ClientMonthlyReport } from "./ClientMonthlyReport";
import { InfoTip } from "./InfoTip";
import { MovimientosCuentaHelpContent } from "./AccountingHelpContent";
import { SourceBadge } from "./SourceBadge";
import { BatchPreviewDrawer } from "../../batch/components/BatchPreviewDrawer";

interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse | null;
  mode?: "RECEIVABLE" | "PAYABLE";
  onPay?: (account: AccountsPayableResponse) => void;
  onExportPdf?: (
    account: AccountsPayableResponse,
    movements: StatementMovementRow[],
  ) => void;
  onExportMonthlyPdf?: (input: ClientMonthlyReportPdfInput) => void;
  initialRange?: { from: string; to: string };
  onRangeChange?: (from: string, to: string) => void;
  onSuccessToast?: (message: string) => void;
}

export const AccountDetailDrawer = ({
  open,
  onClose,
  account,
  mode,
  onPay,
  onExportPdf,
  onExportMonthlyPdf,
  initialRange,
  onRangeChange,
  onSuccessToast,
}: Props) => {
  const {
    data: movements = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAccountsPayableMovements(account?.id);
  const [previewBatchId, setPreviewBatchId] = useState<number | null>(null);
  const [previewSaleId, setPreviewSaleId] = useState<number | null>(null);
  const [reversingId, setReversingId] = useState<number | null>(null);
  const [reverseReason, setReverseReason] = useState("");
  const reverseApplication = useReverseApplication();
  const applyRemainder = useApplyRemainder();
  const { data: credits = [] } = useUnappliedPayments(
    account?.debtorId,
    account?.creditorId,
  );
  const creditTotal = totalUnapplied(credits);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRange, setReportRange] = useState(() => ({
    from: formatDateToISO(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    to: formatDateToISO(new Date()),
  }));

  useEffect(() => {
    if (open && initialRange) {
      setReportRange(initialRange);
    }
  }, [open, initialRange]);

  useEffect(() => {
    setReversingId(null);
    setReverseReason("");
  }, [open, account?.id]);

  const handleReverse = (movementId: number) => {
    if (!reverseReason.trim()) return;
    reverseApplication.mutate(
      { movementId, reason: reverseReason.trim() },
      {
        onSuccess: () => {
          onSuccessToast?.(
            "Aplicación revertida · el monto queda como saldo a favor",
          );
          setReversingId(null);
          setReverseReason("");
        },
      },
    );
  };

  const handleApplyCredit = (paymentId: number, remaining: number) => {
    if (!account) return;
    applyRemainder.mutate(
      {
        paymentId,
        payload: {
          accountsPayableId: account.id,
          note: "Aplicación de saldo a favor",
        },
      },
      {
        onSuccess: () => {
          onSuccessToast?.(`Saldo a favor aplicado · ${formatMXN(remaining)}`);
        },
      },
    );
  };

  const handleRangeChange = (from: string, to: string) => {
    setReportRange({ from, to });
    onRangeChange?.(from, to);
  };

  const { data: entities = [] } = useAccountingEntities();
  const creditorNames = useMemo(
    () => new Map(entities.map((e) => [e.id, e.name] as const)),
    [entities],
  );

  const showMonthlyReport = mode === "RECEIVABLE";

  const partyName =
    mode === "PAYABLE" ? account?.creditorName : account?.debtorName;
  const { data: recent = [], isLoading: loadingRecent } =
    useRecentPayments(100);
  const relatedPayments = (recent ?? []).filter((p) => {
    if (!partyName) return false;
    return p.payerName === partyName || p.receiverName === partyName;
  });

  const statementRows: StatementMovementRow[] = useMemo(
    () =>
      movements.map((m) => ({
        key: `movement-${m.id}`,
        movementDate: m.movementDate,
        movementType: m.movementType,
        amount: m.amount,
        balanceAfter: m.balanceAfter,
        folio: m.folio ?? null,
        note: m.note ?? null,
      })),
    [movements],
  );

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        position="right"
        className="w-[560px]"
      >
        <DrawerHeader
          title={`Estado de cuenta · ${account ? `${account.debtorName} → ${account.creditorName}` : "—"}`}
        />
        <DrawerItems>
          {!account ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Selecciona una cuenta para ver el detalle.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    Total: <strong>{formatMXN(account.totalAmount)}</strong>
                  </p>
                  <SourceBadge
                    sourceType={account.sourceType}
                    sourceBatchId={account.sourceBatchId}
                    sourceId={account.sourceId}
                    onOpenSource={(batchId, saleId) => {
                      setPreviewBatchId(batchId);
                      setPreviewSaleId(saleId ?? null);
                    }}
                  />
                </div>
                <p className="text-sm">
                  Saldo actual:{" "}
                  <strong className="text-blue-600">
                    {formatMXN(account.balance)}
                  </strong>
                </p>
                {account.note && (
                  <p className="text-sm">
                    Notas:{" "}
                    <strong className="text-blue-600">{account.note}</strong>
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  {onPay && (
                    <Button size="xs" onClick={() => onPay(account)}>
                      Registrar pago
                    </Button>
                  )}
                  {onExportPdf && statementRows.length > 0 && (
                    <Button
                      size="xs"
                      color="gray"
                      onClick={() => onExportPdf(account, statementRows)}
                    >
                      <HiDocumentDownload className="mr-1 h-4 w-4" />
                      Exportar PDF
                    </Button>
                  )}
                </div>
              </div>

              {account.balance > 0 && creditTotal > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                  <p className="font-medium">
                    Saldo a favor disponible: {formatMXN(creditTotal)}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {credits
                      .filter((c) => (c.remainingAmount ?? 0) > 0)
                      .map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-xs">
                            {c.folio ? `Folio ${c.folio} · ` : ""}
                            {formatHumanDate(c.paymentDate)} ·{" "}
                            {formatMXN(c.remainingAmount ?? 0)}
                          </span>
                          <Button
                            size="xs"
                            color="warning"
                            onClick={() =>
                              handleApplyCredit(c.id, c.remainingAmount ?? 0)
                            }
                            disabled={applyRemainder.isPending}
                          >
                            Aplicar a esta cuenta
                          </Button>
                        </li>
                      ))}
                  </ul>
                  {applyRemainder.error && (
                    <div className="mt-2">
                      <AccountingErrorAlert
                        error={applyRemainder.error}
                        title="No se pudo aplicar el saldo"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-white">
                  Movimientos de esta cuenta
                  <InfoTip title="Movimientos de esta cuenta" align="left">
                    <MovimientosCuentaHelpContent />
                  </InfoTip>
                </p>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Spinner />
                  </div>
                ) : isError ? (
                  <AccountingErrorAlert
                    error={error}
                    onRetry={() => refetch()}
                  />
                ) : statementRows.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Esta cuenta aún no tiene movimientos registrados.
                  </p>
                ) : (
                  <Table>
                    <TableHead>
                      <TableHeadCell>Fecha</TableHeadCell>
                      <TableHeadCell>Movimiento</TableHeadCell>
                      <TableHeadCell>Monto</TableHeadCell>
                      <TableHeadCell>Saldo</TableHeadCell>
                      <TableHeadCell>
                        <span className="sr-only">Acciones</span>
                      </TableHeadCell>
                    </TableHead>
                    <TableBody>
                      {statementRows.map((row, index) => {
                        const movement = movements[index];
                        const reversible =
                          movement && isReversibleMovement(movement, account);
                        const isReversing =
                          movement && reversingId === movement.id;
                        return (
                          <TableRow key={row.key}>
                            <TableCell>
                              {formatHumanDate(row.movementDate)}
                            </TableCell>
                            <TableCell>
                              <Badge color="gray">
                                {statementRowLabel(row.movementType)}
                              </Badge>
                              {row.folio ? (
                                <span className="ml-1 text-[11px] text-gray-400">
                                  {row.folio}
                                </span>
                              ) : null}
                            </TableCell>
                            <TableCell>{formatMXN(row.amount)}</TableCell>
                            <TableCell className="font-semibold">
                              {formatMXN(row.balanceAfter)}
                            </TableCell>
                            <TableCell>
                              {reversible && movement && !isReversing && (
                                <Button
                                  size="xs"
                                  color="gray"
                                  onClick={() => {
                                    setReversingId(movement.id);
                                    setReverseReason("");
                                  }}
                                  disabled={reverseApplication.isPending}
                                >
                                  <HiArrowLeft className="mr-1 h-3 w-3" />
                                  Revertir
                                </Button>
                              )}
                              {reversible && movement && isReversing && (
                                <div className="flex flex-col gap-1">
                                  <TextInput
                                    sizing="sm"
                                    placeholder="Motivo"
                                    value={reverseReason}
                                    onChange={(e) =>
                                      setReverseReason(e.target.value)
                                    }
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      size="xs"
                                      color="failure"
                                      onClick={() => handleReverse(movement.id)}
                                      disabled={
                                        !reverseReason.trim() ||
                                        reverseApplication.isPending
                                      }
                                    >
                                      Confirmar
                                    </Button>
                                    <Button
                                      size="xs"
                                      color="gray"
                                      onClick={() => {
                                        setReversingId(null);
                                        setReverseReason("");
                                      }}
                                      disabled={reverseApplication.isPending}
                                    >
                                      Atrás
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                {reverseApplication.error && (
                  <div className="mt-2">
                    <AccountingErrorAlert
                      error={reverseApplication.error}
                      title="No se pudo revertir la aplicación"
                    />
                  </div>
                )}
              </div>

              {showMonthlyReport ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setReportOpen((v) => !v)}
                    className="mb-2 text-sm font-semibold text-white hover:underline"
                    aria-expanded={reportOpen}
                  >
                    Reporte del cliente {reportOpen ? "▾" : "▸"}
                  </button>
                  {reportOpen && (
                    <ClientMonthlyReport
                      debtorEntityId={account.debtorId}
                      debtorName={account.debtorName}
                      from={reportRange.from}
                      to={reportRange.to}
                      onRangeChange={handleRangeChange}
                      creditorNames={creditorNames}
                      onExportPdf={onExportMonthlyPdf}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-sm font-semibold text-white">
                    Pagos relacionados
                  </p>
                  {loadingRecent ? (
                    <div className="flex justify-center py-6">
                      <Spinner />
                    </div>
                  ) : relatedPayments.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Sin pagos recientes para {partyName ?? "esta cuenta"}.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-700">
                      {relatedPayments.slice(0, 20).map((p) => (
                        <li
                          key={p.id}
                          className="flex justify-between py-2 text-sm"
                        >
                          <span className="text-gray-300">
                            {formatHumanDate(p.paymentDate)} · {p.payerName} →{" "}
                            {p.receiverName}
                          </span>
                          <span className="font-semibold text-white">
                            {formatMXN(p.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </DrawerItems>
      </Drawer>
      <BatchPreviewDrawer
        open={previewBatchId != null}
        onClose={() => {
          setPreviewBatchId(null);
          setPreviewSaleId(null);
        }}
        batchId={previewBatchId}
        highlightSaleId={previewSaleId}
      />
    </>
  );
};
