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
import { formatHumanDate } from "@/utils/date.utils";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import {
  statementRowLabel,
  type StatementMovementRow,
} from "../utils/openAccounts";
import {
  isCreditApplicationNote,
  isReversibleMovement,
  planCreditApplication,
  totalUnapplied,
} from "../utils/unappliedCredit";
import { useAccountsPayableMovements } from "../api/movements.queries";
import {
  useApplyCreditsToAccount,
  useApplyRemainder,
  useReverseApplication,
  useUnappliedPayments,
} from "../api/payments.queries";
import { AccountingErrorAlert } from "./AccountingErrorAlert";
import { AccountPaymentsList } from "./AccountPaymentsList";
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
  onOpenClientReport?: (account: AccountsPayableResponse) => void;
  onSuccessToast?: (message: string) => void;
}

export const AccountDetailDrawer = ({
  open,
  onClose,
  account,
  mode,
  onPay,
  onExportPdf,
  onOpenClientReport,
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
  const applyCredits = useApplyCreditsToAccount();
  const [bulkApplyOpen, setBulkApplyOpen] = useState(false);
  const { data: credits = [] } = useUnappliedPayments(
    account?.debtorId,
    account?.creditorId,
  );
  const creditTotal = totalUnapplied(credits);
  const creditPlan = useMemo(
    () =>
      planCreditApplication(
        credits.filter((c) => (c.remainingAmount ?? 0) > 0),
        account?.balance ?? 0,
      ),
    [credits, account?.balance],
  );

  useEffect(() => {
    setReversingId(null);
    setReverseReason("");
    setBulkApplyOpen(false);
  }, [open, account?.id]);

  const handleApplyAllCredits = () => {
    if (!account) return;
    applyCredits.mutate(account.id, {
      onSuccess: (response) => {
        onSuccessToast?.(
          `Saldo a favor aplicado · ${formatMXN(response.data.totalApplied)}`,
        );
        setBulkApplyOpen(false);
      },
    });
  };

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
        },
      },
      {
        onSuccess: () => {
          onSuccessToast?.(`Saldo a favor aplicado · ${formatMXN(remaining)}`);
        },
      },
    );
  };

  const showClientReport = mode === "RECEIVABLE";

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
                <div className="flex flex-wrap gap-2 pt-2">
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
                  {showClientReport && onOpenClientReport && (
                    <Button
                      size="xs"
                      color="gray"
                      onClick={() => onOpenClientReport(account)}
                    >
                      Reporte del cliente
                    </Button>
                  )}
                </div>
              </div>

              {account.balance > 0 && creditTotal > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                  <p className="font-medium">
                    Saldo a favor disponible: {formatMXN(creditTotal)}
                  </p>
                  {bulkApplyOpen ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs">
                        Se aplicará a esta cuenta del crédito más antiguo al más
                        reciente:
                      </p>
                      <ul className="space-y-1">
                        {creditPlan.items.map((item) => (
                          <li
                            key={item.paymentId}
                            className="flex justify-between text-xs"
                          >
                            <span>
                              {item.folio ? `folio ${item.folio}` : "Sin folio"}
                            </span>
                            <span>{formatMXN(item.amount)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs">
                        {creditPlan.resultingBalance > 0
                          ? `La cuenta quedaría con un saldo de ${formatMXN(creditPlan.resultingBalance)}.`
                          : "La cuenta quedaría liquidada."}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          color="warning"
                          onClick={handleApplyAllCredits}
                          disabled={applyCredits.isPending}
                        >
                          Confirmar aplicación
                        </Button>
                        <Button
                          size="xs"
                          color="gray"
                          onClick={() => setBulkApplyOpen(false)}
                          disabled={applyCredits.isPending}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="xs"
                        color="warning"
                        className="mt-2"
                        onClick={() => setBulkApplyOpen(true)}
                        disabled={applyCredits.isPending}
                      >
                        Aplicar {formatMXN(creditPlan.totalApplied)} de saldo a
                        favor a esta cuenta
                      </Button>
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
                                  handleApplyCredit(
                                    c.id,
                                    c.remainingAmount ?? 0,
                                  )
                                }
                                disabled={applyRemainder.isPending}
                              >
                                Aplicar a esta cuenta
                              </Button>
                            </li>
                          ))}
                      </ul>
                    </>
                  )}
                  {applyCredits.error && (
                    <div className="mt-2">
                      <AccountingErrorAlert
                        error={applyCredits.error}
                        title="No se pudo aplicar el saldo"
                      />
                    </div>
                  )}
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
                <p className="mb-1 flex items-center gap-1 text-sm font-semibold text-white">
                  Movimientos de esta cuenta
                  <InfoTip title="Movimientos de esta cuenta" align="left">
                    <MovimientosCuentaHelpContent />
                  </InfoTip>
                </p>
                <p className="mb-2 text-xs text-gray-400">
                  Cargos, pagos y ajustes que cambiaron el saldo de esta deuda.
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
                              {isCreditApplicationNote(row.note) && (
                                <Badge color="warning" className="ml-1">
                                  Saldo a favor
                                </Badge>
                              )}
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

              <div>
                <p className="mb-1 text-sm font-semibold text-white">
                  Pagos de esta cuenta
                </p>
                <p className="mb-2 text-xs text-gray-400">
                  Pagos entre estas dos partes. Desde aquí puedes cancelar un
                  pago equivocado.
                </p>
                <AccountPaymentsList
                  payerId={account.debtorId}
                  receiverId={account.creditorId}
                  partyLabel={account.debtorName}
                  onSuccessToast={onSuccessToast}
                />
              </div>
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
