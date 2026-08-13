import {
  Table,
  Button,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from "flowbite-react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import { useMemo, useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { SourceBadge } from "@/features/accounting/components/SourceBadge";
import { BatchPreviewDrawer } from "@/features/batch/components/BatchPreviewDrawer";

interface Props {
  data: AccountsPayableResponse[];
  onPay: (account: AccountsPayableResponse) => void;
  onViewHistory: (account: AccountsPayableResponse) => void;
}

export const BranchesAccountsOpenTable = ({
  data,
  onPay,
  onViewHistory,
}: Props) => {
  const [dateSort, setDateSort] = useState<"desc" | "asc">("desc");
  const [previewBatchId, setPreviewBatchId] = useState<number | null>(null);
  const [previewSaleId, setPreviewSaleId] = useState<number | null>(null);

  const sortedData = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return dateSort === "desc" ? -cmp : cmp;
    });
    return copy;
  }, [data, dateSort]);

  if (!data.length) {
    return <div className="text-sm text-gray-500">No hay cuentas abiertas</div>;
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableHeadCell>Relación</TableHeadCell>
          <TableHeadCell>Origen</TableHeadCell>
          <TableHeadCell>Total</TableHeadCell>
          <TableHeadCell>Saldo</TableHeadCell>
          <TableHeadCell>
            <button
              type="button"
              onClick={() =>
                setDateSort((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 uppercase hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"
            >
              Creada
              {dateSort === "desc" ? (
                <HiSortDescending className="h-3.5 w-3.5" />
              ) : (
                <HiSortAscending className="h-3.5 w-3.5" />
              )}
            </button>
          </TableHeadCell>
          <TableHeadCell> Acciones</TableHeadCell>
        </TableHead>

        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {row.debtorName} → {row.creditorName}
              </TableCell>

              <TableCell>
                <SourceBadge
                  sourceType={row.sourceType}
                  sourceBatchId={row.sourceBatchId}
                  sourceId={row.sourceId}
                  onOpenSource={(batchId, saleId) => {
                    setPreviewBatchId(batchId);
                    setPreviewSaleId(saleId ?? null);
                  }}
                />
              </TableCell>

              <TableCell>{formatMXN(row.totalAmount)}</TableCell>

              <TableCell className="font-semibold">
                {formatMXN(row.balance)}
              </TableCell>

              <TableCell>{formatHumanDate(row.date)}</TableCell>

              <TableCell className="flex gap-2">
                <Tooltip content="Registrar pago">
                  <Button
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPay(row);
                    }}
                  >
                    <FaMoneyBillWave size={20} />
                  </Button>
                </Tooltip>
                <Tooltip content="Mostrar información">
                  <Button
                    size="xs"
                    color="gray"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewHistory(row);
                    }}
                  >
                    <FaRegFileLines size={20} />
                  </Button>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
