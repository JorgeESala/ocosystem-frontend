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
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { HiDocumentDownload } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDateToISO, formatHumanDate } from "@/utils/date.utils";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import {
  statementRowLabel,
  type StatementMovementRow,
} from "../utils/openAccounts";
import type { ClientMonthlyReportPdfInput } from "../api/client-summary.api";
import { useAccountingEntities } from "../api/accounting-entities.queries";
import { useAccountsPayableMovements } from "../api/movements.queries";
import { useRecentPayments } from "../api/payments.queries";
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
                    </TableHead>
                    <TableBody>
                      {statementRows.map((row) => (
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
