import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { HiExclamationCircle } from "react-icons/hi";
import { deltaPct } from "@/features/branches/reports/utils/consolidatedMetrics";
import DeltaWithValues from "./DeltaWithValues";
import { formatMXNCompact } from "@/utils/moneyNumbers";
import type { BranchesDashboardBranchDTO } from "../api/branchesDashboard.types";

interface Props {
  rows: BranchesDashboardBranchDTO[];
  expectedDays: number;
  slug: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const reconciliationLabel = (row: BranchesDashboardBranchDTO): string => {
  switch (row.reconciliationStatus) {
    case "MATCH":
      return "OK";
    case "DIFFERENCE":
      return `Diferencia ${(row.chickenVariancePct ?? 0).toFixed(1)}%`;
    case "INCOMPLETE":
      return "Incompleta";
    default:
      return "Sin datos";
  }
};

const reconciliationClass = (row: BranchesDashboardBranchDTO): string => {
  switch (row.reconciliationStatus) {
    case "MATCH":
      return "text-emerald-300";
    case "DIFFERENCE":
      return "text-amber-300";
    case "INCOMPLETE":
      return "text-slate-400";
    default:
      return "text-slate-500";
  }
};

export default function BranchHealthTable({
  rows,
  expectedDays,
  slug,
  isLoading = false,
  isError = false,
  onRetry,
}: Props) {
  const navigate = useNavigate();

  const openBranchReport = (branchId: number) => {
    navigate(`/business/${slug}/reports?branch=${branchId}`);
  };
  if (isError) {
    return (
      <section className="rounded-2xl border border-rose-900/60 bg-rose-950/30 p-5">
        <div className="flex items-start gap-3">
          <HiExclamationCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-100">
              No se pudo cargar el estado de las sucursales.
            </p>
          </div>
          {onRetry && (
            <Button size="xs" color="failure" onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
          Estado por sucursal
        </h2>
        {isLoading && <span className="text-xs text-slate-500">Cargando…</span>}
      </div>

      {isLoading && rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Cargando estado de sucursales…
        </p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Sin sucursales en el periodo.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Sucursal</TableHeadCell>
                <TableHeadCell>Venta total</TableHeadCell>
                <TableHeadCell>vs anterior</TableHeadCell>
                <TableHeadCell>Pollo</TableHeadCell>
                <TableHeadCell>Otros</TableHeadCell>
                <TableHeadCell>Reportes</TableHeadCell>
                <TableHeadCell>Conciliación</TableHeadCell>
                <TableHeadCell>Pérdida neta (merma)</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-slate-800">
              {rows.map((row) => (
                <TableRow
                  key={row.branchId}
                  className="cursor-pointer bg-transparent hover:bg-slate-800/60"
                  onClick={() => openBranchReport(row.branchId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openBranchReport(row.branchId);
                    }
                  }}
                  tabIndex={0}
                >
                  <TableCell className="font-medium text-white">
                    <Link
                      to={`/business/${slug}/reports?branch=${row.branchId}`}
                      className="hover:text-blue-300 hover:underline"
                    >
                      {row.branchName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-200">
                    {formatMXNCompact(row.totalSales)}
                  </TableCell>
                  <TableCell>
                    <DeltaWithValues
                      value={deltaPct(row.totalSales, row.previousTotalSales)}
                      current={row.totalSales}
                      previous={row.previousTotalSales}
                      trimmedDays={row.comparisonTrimmed ? row.trimmedDays : 0}
                      suffix=""
                    />
                    {row.comparisonTrimmed && (
                      <span
                        title="Esta comparativa excluye los días sin reporte y los mismos días de la semana del periodo anterior"
                        className="mt-0.5 block text-[10px] font-semibold text-amber-300"
                      >
                        sin {row.trimmedDays}{" "}
                        {row.trimmedDays === 1 ? "día" : "días"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {formatMXNCompact(row.chickenSales)}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {formatMXNCompact(row.otherProductsSales)}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {row.posDays}/{expectedDays}
                  </TableCell>
                  <TableCell
                    className={`font-medium ${reconciliationClass(row)}`}
                  >
                    {reconciliationLabel(row)}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {row.mermaLossQuantity.toLocaleString("es-MX", {
                      maximumFractionDigits: 1,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
