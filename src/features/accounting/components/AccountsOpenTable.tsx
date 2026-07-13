import {
  Table,
  Button,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Tooltip,
} from "flowbite-react";
import type { AccountsPayableResponse } from "../../live-chicken/accounting/accounts-payable/types";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import { useMemo, useState } from "react";
import { useSolicitors } from "../api/solicitor.queries";
import { useUpdateAccountsPayableSolicitor } from "../api/accounts-payable.queries";
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { FaMoneyBillWave, FaPlus, FaRegEdit } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { SourceBadge } from "./SourceBadge";
import { BatchPreviewDrawer } from "../../batch/components/BatchPreviewDrawer";
interface Props {
  data: AccountsPayableResponse[];
  onPay: (account: AccountsPayableResponse) => void;
  onViewHistory: (account: AccountsPayableResponse) => void;
}

export const AccountsOpenTable = ({ data, onPay, onViewHistory }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedSolicitorId, setSelectedSolicitorId] = useState<number | null>(
    null,
  );
  const [dateSort, setDateSort] = useState<"desc" | "asc">("desc");
  const [previewBatchId, setPreviewBatchId] = useState<number | null>(null);
  const [previewSaleId, setPreviewSaleId] = useState<number | null>(null);

  const { data: solicitors = [] } = useSolicitors();
  const updateSolicitorMutation = useUpdateAccountsPayableSolicitor();

  const sortedData = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return dateSort === "desc" ? -cmp : cmp;
    });
    return copy;
  }, [data, dateSort]);

  const handleSaveSolicitor = (id: number) => {
    updateSolicitorMutation.mutate({
      id,
      solicitorId: selectedSolicitorId ?? null,
    });

    setEditingId(null);
    setSelectedSolicitorId(null);
  };

  if (!data.length) {
    return <div className="text-sm text-gray-500">No hay cuentas abiertas</div>;
  }

  return (
    <>
    <Table>
      <TableHead>
        <TableHeadCell>Relación</TableHeadCell>
        <TableHeadCell>Origen</TableHeadCell>
        <TableHeadCell>Solicitante</TableHeadCell>
        <TableHeadCell>Total</TableHeadCell>
        <TableHeadCell>Saldo</TableHeadCell>
        <TableHeadCell>
          <button
            type="button"
            onClick={() =>
              setDateSort((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            className="inline-flex items-center gap-1 text-xs font-medium uppercase text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"
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

            <TableCell>
              {editingId === row.id ? (
                <div className="flex items-center gap-2">
                  <Select
                    className="rounded border border-gray-600 bg-gray-800 text-sm"
                    value={selectedSolicitorId ?? ""}
                    onChange={(e) =>
                      setSelectedSolicitorId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">Seleccionar...</option>
                    {solicitors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>

                  <Button size="xs" onClick={() => handleSaveSolicitor(row.id)}>
                    <FiCheck size={16} />
                  </Button>

                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => {
                      setEditingId(null);
                      setSelectedSolicitorId(null);
                    }}
                  >
                    <RxCross2 size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{row.solicitorName ? row.solicitorName : "N/A"}</span>

                  <button
                    className="text-xs text-blue-400 hover:text-blue-300"
                    onClick={async (e) => {
                      e.stopPropagation();
                      setEditingId(row.id);
                      setSelectedSolicitorId(row.solicitorId ?? null);
                    }}
                  >
                    {row.solicitorName ? <FaRegEdit size={16} /> : <FaPlus />}
                  </button>
                </div>
              )}
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
