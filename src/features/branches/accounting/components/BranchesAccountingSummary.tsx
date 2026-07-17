import { useState } from "react";
import {
  Button,
  Spinner,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { HiDocumentDownload, HiChevronDown, HiChevronUp } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import {
  useFinancialSummary,
  useDownloadFinancialSummaryPdf,
} from "../api/financial-summary.queries";

interface Props {
  selectedBranchIds: number[];
  from?: string;
  to?: string;
}

export const BranchesAccountingSummary = ({
  selectedBranchIds,
  from,
  to,
}: Props) => {
  const {
    data: rows = [],
    isLoading,
    isError,
  } = useFinancialSummary(
    selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
    from,
    to,
  );

  const { download: downloadPdf } = useDownloadFinancialSummaryPdf();
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedBranch, setExpandedBranch] = useState<number | null>(null);

  const totalDebt = rows.reduce((sum, r) => sum + Number(r.debt), 0);
  const totalPending = rows.reduce(
    (sum, r) => sum + Number(r.pendingAmount),
    0,
  );
  const totalInventory = rows.reduce(
    (sum, r) => sum + Number(r.inventoryValue),
    0,
  );
  const totalNet = rows.reduce((sum, r) => sum + Number(r.netBalance), 0);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadPdf(
        selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
        from,
        to,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-400">
          Cargando resumen financiero...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-6 text-center text-sm text-red-300">
        Error al cargar el resumen financiero.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-center text-sm text-gray-400">
        No hay datos financieros para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {rows.map((m) => (
            <span
              key={m.branchId}
              className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-1 text-[11px] text-gray-300"
              title={`Deuda: ${formatMXN(m.debt)} · Por recibir: ${formatMXN(m.pendingAmount)} · Inventario: ${formatMXN(m.inventoryValue)}`}
            >
              <span className="font-medium text-white">{m.branchName}</span>
              <span
                className={
                  m.netBalance >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                {formatMXN(m.netBalance)}
              </span>
            </span>
          ))}
        </div>
        <Button
          color="gray"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
        >
          <HiDocumentDownload className="mr-2 h-4 w-4" />
          {isDownloading ? "Generando..." : "Exportar PDF"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-5">
          <p className="text-[10px] font-medium tracking-wider text-red-300 uppercase">
            Deuda total
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatMXN(totalDebt)}
          </p>
          <p className="text-[11px] text-gray-400">Cuentas por pagar</p>
        </div>

        <div className="rounded-lg border border-yellow-900/40 bg-yellow-950/20 p-5">
          <p className="text-[10px] font-medium tracking-wider text-yellow-300 uppercase">
            Por recibir
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatMXN(totalPending)}
          </p>
          <p className="text-[11px] text-gray-400">
            Ventas sin recibir en oficina
          </p>
        </div>

        <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-5">
          <p className="text-[10px] font-medium tracking-wider text-blue-300 uppercase">
            Valor en inventario
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatMXN(totalInventory)}
          </p>
          <p className="text-[11px] text-gray-400">
            Pollos disponibles en remesas
          </p>
        </div>

        <div
          className={`rounded-lg border p-5 ${
            totalNet >= 0
              ? "border-green-900/40 bg-green-950/20"
              : "border-red-900/40 bg-red-950/20"
          }`}
        >
          <p
            className={`text-[10px] font-medium tracking-wider uppercase ${
              totalNet >= 0 ? "text-green-300" : "text-red-300"
            }`}
          >
            Balance neto
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatMXN(totalNet)}
          </p>
          <p className="text-[11px] text-gray-400">Activos - Deuda</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
        <Table>
          <TableHead>
            <TableHeadCell>Sucursal</TableHeadCell>
            <TableHeadCell>Deuda</TableHeadCell>
            <TableHeadCell>Por recibir</TableHeadCell>
            <TableHeadCell>Inventario</TableHeadCell>
            <TableHeadCell>Balance neto</TableHeadCell>
          </TableHead>
          <TableBody>
            {rows.map((m) => {
              const hasBreakdown =
                m.inventoryBreakdown && m.inventoryBreakdown.length > 0;
              const isExpanded = expandedBranch === m.branchId;

              return (
                <>
                  <TableRow
                    key={m.branchId}
                    className={hasBreakdown ? "cursor-pointer hover:bg-gray-700/40" : ""}
                    onClick={() =>
                      hasBreakdown &&
                      setExpandedBranch(isExpanded ? null : m.branchId)
                    }
                  >
                    <TableCell className="font-medium text-white">
                      <span className="flex items-center gap-2">
                        {hasBreakdown &&
                          (isExpanded ? (
                            <HiChevronUp size={14} className="text-gray-400" />
                          ) : (
                            <HiChevronDown size={14} className="text-gray-400" />
                          ))}
                        {m.branchName}
                      </span>
                    </TableCell>
                    <TableCell className="text-red-300">
                      {formatMXN(m.debt)}
                    </TableCell>
                    <TableCell className="text-yellow-300">
                      {formatMXN(m.pendingAmount)}
                    </TableCell>
                    <TableCell className="text-blue-300">
                      {formatMXN(m.inventoryValue)}
                    </TableCell>
                    <TableCell
                      className={`font-semibold ${m.netBalance >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {formatMXN(m.netBalance)}
                    </TableCell>
                  </TableRow>
                  {isExpanded && hasBreakdown && (
                    <TableRow key={`${m.branchId}-breakdown`}>
                      <TableCell colSpan={5}>
                        <div className="ml-6 rounded border border-blue-800 bg-blue-950/10 p-3">
                          <p className="mb-2 text-xs font-semibold text-blue-400">
                            Desglose de inventario — {m.branchName}
                          </p>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHead>
                                <TableHeadCell>Remesa</TableHeadCell>
                                <TableHeadCell>Fecha</TableHeadCell>
                                <TableHeadCell>Iniciales</TableHeadCell>
                                <TableHeadCell>Restantes</TableHeadCell>
                                <TableHeadCell>Costo total</TableHeadCell>
                                <TableHeadCell>Disponible</TableHeadCell>
                              </TableHead>
                              <TableBody>
                                {m.inventoryBreakdown!.map((item) => (
                                  <TableRow key={item.batchId}>
                                    <TableCell className="font-medium text-white">
                                      #{item.batchId}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                      {formatHumanDate(item.entryDate, "short")}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                      {item.initialQuantity.toLocaleString("es-MX")}
                                    </TableCell>
                                    <TableCell className="text-blue-300 font-medium">
                                      {item.remainingQuantity.toLocaleString("es-MX")}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                      {formatMXN(item.totalCost)}
                                    </TableCell>
                                    <TableCell className="text-blue-300 font-semibold">
                                      {formatMXN(item.availableCost)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
