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
import { EggQuantityDisplay } from "@/features/batch/components/egg/EggQuantityDisplay";
import {
  useCedisFinancialSummary,
  useDownloadCedisFinancialSummaryPdf,
} from "../api/financial-summary.queries";

interface Props {
  cedisIds?: number[];
  entityType?: string;
  from?: string;
  to?: string;
}

export const CedisFinancialSummary = ({
  cedisIds,
  entityType,
  from,
  to,
}: Props) => {
  const {
    data: rows = [],
    isLoading,
    isError,
  } = useCedisFinancialSummary(
    cedisIds && cedisIds.length > 0 ? cedisIds : undefined,
    entityType,
    from,
    to,
  );

  const { download: downloadPdf } = useDownloadCedisFinancialSummaryPdf();
  const [isDownloading, setIsDownloading] = useState(false);
  const isEgg = entityType === "EGGCEDIS";

  const totalDebt = rows.reduce((sum, r) => sum + Number(r.debt), 0);
  const totalReceivable = rows.reduce(
    (sum, r) => sum + Number(r.receivable),
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
        cedisIds && cedisIds.length > 0 ? cedisIds : undefined,
        entityType,
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
      <div className="flex items-center justify-end">
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
          <p className="text-[11px] text-gray-400">
            Lo que debemos a proveedores
          </p>
        </div>

        <div className="rounded-lg border border-yellow-900/40 bg-yellow-950/20 p-5">
          <p className="text-[10px] font-medium tracking-wider text-yellow-300 uppercase">
            Por cobrar
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatMXN(totalReceivable)}
          </p>
          <p className="text-[11px] text-gray-400">
            Lo que nos deben clientes internos
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
            Lo que tenemos en inventario
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
            <TableHeadCell>CEDIS</TableHeadCell>
            <TableHeadCell>Deuda</TableHeadCell>
            <TableHeadCell>Por cobrar</TableHeadCell>
            <TableHeadCell>Inventario</TableHeadCell>
            <TableHeadCell>Balance neto</TableHeadCell>
          </TableHead>
          <TableBody>
            {rows.map((m) => (
              <CedisRow key={m.cedisId} row={m} isEgg={isEgg} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const CedisRow: React.FC<{ row: any; isEgg?: boolean }> = ({
  row,
  isEgg = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasBreakdown = row.breakdown && row.breakdown.length > 0;
  const hasInventoryBreakdown =
    row.inventoryBreakdown && row.inventoryBreakdown.length > 0;
  const canExpand = hasBreakdown || hasInventoryBreakdown;

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            {canExpand && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-400 hover:text-white"
              >
                {expanded ? (
                  <HiChevronUp size={14} />
                ) : (
                  <HiChevronDown size={14} />
                )}
              </button>
            )}
            <span className="font-medium text-white">{row.cedisName}</span>
          </div>
        </TableCell>
        <TableCell className="text-red-300">{formatMXN(row.debt)}</TableCell>
        <TableCell className="text-yellow-300">
          {formatMXN(row.receivable)}
        </TableCell>
        <TableCell className="text-blue-300">
          {formatMXN(row.inventoryValue)}
        </TableCell>
        <TableCell
          className={`font-semibold ${row.netBalance >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          {formatMXN(row.netBalance)}
        </TableCell>
      </TableRow>
      {expanded && hasBreakdown && (
        <TableRow>
          <TableCell colSpan={5}>
            <div className="ml-6 rounded border border-gray-700 bg-gray-900 p-3">
              <p className="mb-2 text-xs font-semibold text-yellow-400">
                Desglose por cliente interno:
              </p>
              <div className="space-y-1">
                {row.breakdown.map((b: any) => (
                  <div
                    key={b.clientId}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-gray-300">{b.clientName}</span>
                    <span className="font-medium text-yellow-300">
                      {formatMXN(b.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
      {expanded && hasInventoryBreakdown && (
        <TableRow>
          <TableCell colSpan={5}>
            <div className="ml-6 rounded border border-blue-800 bg-blue-950/10 p-3">
              <p className="mb-2 text-xs font-semibold text-blue-400">
                Desglose de inventario por remesa:
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
                    {row.inventoryBreakdown!.map((item: any) => (
                      <TableRow key={item.batchId}>
                        <TableCell className="font-medium text-white">
                          #{item.batchId}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatHumanDate(item.entryDate, "short")}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {isEgg ? (
                            <EggQuantityDisplay
                              totalPieces={item.initialQuantity ?? 0}
                            />
                          ) : (
                            (item.initialQuantity ?? 0).toLocaleString("es-MX")
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-blue-300">
                          {isEgg ? (
                            <EggQuantityDisplay
                              totalPieces={item.remainingQuantity}
                            />
                          ) : (
                            item.remainingQuantity.toLocaleString("es-MX")
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatMXN(item.totalCost)}
                        </TableCell>
                        <TableCell className="font-semibold text-blue-300">
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
};
