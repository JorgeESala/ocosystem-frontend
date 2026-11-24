import { useMemo } from "react";
import {
  Badge,
  Button,
  Card,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { HiChevronDown, HiChevronRight, HiChevronUp } from "react-icons/hi";
import { formatMXN, formatMXNCompact } from "@/utils/moneyNumbers";
import { DeltaBadge } from "./DeltaBadge";
import type { BranchRankingRow } from "../utils/consolidatedMetrics";
import {
  needsReview,
  reviewReasons,
  REVIEW_VARIANCE_THRESHOLD_PCT,
} from "../utils/consolidatedMetrics";
import {
  formatKgValue,
  formatMoney,
  formatVariance,
  moneyComparisonState,
} from "../utils/expectedSales";

export type RankingSortKey =
  | "totalSales"
  | "avgTicket"
  | "totalSlaughtered"
  | "mermaQuantity"
  | "daysWithReport"
  | "expectedVariancePct";

export interface RankingSort {
  key: RankingSortKey;
  direction: "asc" | "desc";
}

interface Props {
  rows: BranchRankingRow[];
  expectedDays: number;
  onSelectBranch: (branchId: number, branchName: string) => void;
  sort: RankingSort;
  onSortChange: (sort: RankingSort) => void;
  expectedError?: boolean;
}

const SORT_OPTIONS: { value: RankingSortKey; label: string }[] = [
  { value: "totalSales", label: "Venta real" },
  { value: "avgTicket", label: "Ticket promedio" },
  { value: "totalSlaughtered", label: "Pollo beneficiado" },
  { value: "expectedVariancePct", label: "Cumplimiento" },
  { value: "mermaQuantity", label: "Merma total" },
  { value: "daysWithReport", label: "Cobertura" },
];

const formatQuantity = (value: number) =>
  value.toLocaleString("es-MX", { maximumFractionDigits: 1 });

const formatPieces = (value: number) =>
  value.toLocaleString("es-MX", { maximumFractionDigits: 0 });

const compliancePct = (row: BranchRankingRow): number | null => {
  if (
    row.expectedKg == null ||
    row.expectedReportedKg == null ||
    row.expectedKg <= 0
  ) {
    return null;
  }
  return (row.expectedReportedKg / row.expectedKg) * 100;
};

const complianceColor = (variancePct: number | null): string => {
  if (variancePct == null) return "text-gray-400";
  const deviation = Math.abs(variancePct);
  if (deviation >= REVIEW_VARIANCE_THRESHOLD_PCT) return "text-red-400";
  if (deviation >= 5) return "text-amber-400";
  return "text-green-400";
};

const ShareBar = ({
  share,
  className = "",
}: {
  share: number;
  className?: string;
}) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-700">
      <div
        className="h-full rounded-full bg-blue-500"
        style={{ width: `${Math.min(100, share)}%` }}
      />
    </div>
    <span className="text-xs text-gray-400">{share.toFixed(1)}% del total</span>
  </div>
);

const ReviewBadge = ({ row }: { row: BranchRankingRow }) => {
  if (!needsReview(row)) return null;
  const reasons = reviewReasons(row);
  return (
    <span title={reasons.join(" ")}>
      <Badge color="warning" className="w-fit">
        Revisar
      </Badge>
    </span>
  );
};

const ComplianceCell = ({
  row,
  align = "end",
  expectedError = false,
}: {
  row: BranchRankingRow;
  align?: "start" | "end";
  expectedError?: boolean;
}) => {
  const compliance = compliancePct(row);
  const alignment =
    align === "end" ? "items-end text-right" : "items-start text-left";

  if (compliance == null) {
    const missingLabel = expectedError
      ? "No se pudo cargar la venta esperada"
      : !row.expectedLoaded
        ? "Cargando kilos esperados"
        : row.expectedKg == null
          ? "Sin kilos esperados"
          : "Sin kilos vendidos";
    return (
      <div className={`flex flex-col ${alignment}`}>
        <span className="text-sm text-gray-500">—</span>
        <span className="text-xs text-gray-500">{missingLabel}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${alignment}`}>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-semibold tabular-nums ${complianceColor(
            row.expectedVariancePct,
          )}`}
        >
          {compliance.toFixed(1)}%
        </span>
        <span className="text-xs text-gray-400 tabular-nums">
          {formatVariance(row.expectedVariancePct)}
        </span>
      </div>
      <span className="text-xs text-gray-400">
        {formatKgValue(row.expectedReportedKg)} vendidos ·{" "}
        {formatKgValue(row.expectedKg)} esperados
      </span>
      {row.expectedMoney != null && row.expectedReportedMoney != null ? (
        <span
          className={`text-xs tabular-nums ${
            moneyComparisonState(
              row.expectedMoney,
              row.expectedReportedMoney,
            ) === "below"
              ? "text-red-400"
              : moneyComparisonState(
                    row.expectedMoney,
                    row.expectedReportedMoney,
                  ) === "within"
                ? "text-amber-400"
                : "text-gray-400"
          }`}
        >
          Mín. {formatMXNCompact(row.expectedMoney)} · Comp.{" "}
          {formatMXNCompact(row.expectedReportedMoney)}
        </span>
      ) : row.expectedLoaded && row.expectedKg != null ? (
        <span className="text-xs text-gray-500">
          {row.referenceProductBarcode
            ? row.referencePriceMissing
              ? "Sin precio de referencia"
              : row.expectedSalesWithoutReportedMoney > 0
                ? "Sin monto registrado"
                : "Sin precio de referencia"
            : "Sin producto de referencia"}
        </span>
      ) : null}
    </div>
  );
};

const CoverageCell = ({
  row,
  expectedDays,
  align = "end",
}: {
  row: BranchRankingRow;
  expectedDays: number;
  align?: "start" | "end";
}) => {
  const alignment = align === "end" ? "justify-end" : "justify-start";
  return (
    <div className={`flex ${alignment}`}>
      {row.missingDays > 0 ? (
        <Badge color="warning" className="w-fit">
          {row.daysWithReport}/{expectedDays} días
        </Badge>
      ) : (
        <span className="text-xs font-semibold text-green-400">
          {row.daysWithReport}/{expectedDays} días
        </span>
      )}
    </div>
  );
};

const legend = (
  <div className="mt-3 space-y-1 text-xs text-gray-500">
    <p>
      Cumplimiento = kg vendidos / kg esperados. Esperado = (peso promedio de la
      remesa − 250 g) × pollos vendidos.
    </p>
    <p>
      Venta mínima = kg esperados × el último precio de venta del producto de
      referencia de cada día. Comp. es la venta registrada en los días con
      precio; el total incluye todos los días. Se permite 0.5% de tolerancia por
      redondeo. No es una meta ni una proyección.
    </p>
    <p>
      El color de Cumplimiento indica la desviación: verde ±5%, ámbar 5–10%,
      rojo ≥{REVIEW_VARIANCE_THRESHOLD_PCT}%. Merma total incluye tripa; la
      Pérdida Neta del KPI la excluye.
    </p>
    <p>
      Revisar = desviación de {REVIEW_VARIANCE_THRESHOLD_PCT}% o más, días sin
      reporte, sin kilos esperados, sin producto o precio de referencia, venta
      sin monto registrado, venta por debajo del mínimo o ventas excluidas del
      cálculo.
    </p>
  </div>
);

export const BranchRankingTable = ({
  rows,
  expectedDays,
  onSelectBranch,
  sort,
  onSortChange,
  expectedError = false,
}: Props) => {
  const sortedRows = useMemo(() => {
    const items = [...rows];
    items.sort((a, b) => {
      const left = a[sort.key] ?? null;
      const right = b[sort.key] ?? null;
      if (left === null && right === null) return 0;
      if (left === null) return 1;
      if (right === null) return -1;
      if (left === right) return 0;
      const comparison = left > right ? 1 : -1;
      return sort.direction === "asc" ? comparison : -comparison;
    });
    return items;
  }, [rows, sort]);

  const requestSort = (key: RankingSortKey) => {
    onSortChange(
      sort.key === key
        ? { key, direction: sort.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" },
    );
  };

  const sortIcon = (key: RankingSortKey) =>
    sort.key === key ? (
      sort.direction === "asc" ? (
        <HiChevronUp className="inline" />
      ) : (
        <HiChevronDown className="inline" />
      )
    ) : null;

  const toggleDirection = () => {
    onSortChange({
      key: sort.key,
      direction: sort.direction === "desc" ? "asc" : "desc",
    });
  };

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="mb-3 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <h3 className="text-lg font-semibold text-gray-200">
          Ranking de sucursales
        </h3>
        <span className="text-xs text-gray-500">
          Haz clic en una sucursal para ver el detalle
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-2 lg:hidden">
        <div>
          <label
            htmlFor="ranking-sort"
            className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase"
          >
            Ordenar por
          </label>
          <Select
            id="ranking-sort"
            sizing="sm"
            className="w-44"
            value={sort.key}
            onChange={(event) =>
              onSortChange({
                key: event.target.value as RankingSortKey,
                direction: sort.direction,
              })
            }
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Button size="xs" color="gray" onClick={toggleDirection}>
          {sort.direction === "desc" ? "Mayor a menor" : "Menor a mayor"}
        </Button>
      </div>

      <div
        className="hidden overflow-x-auto lg:block"
        data-testid="ranking-table"
      >
        <Table hoverable className="dark min-w-[900px]">
          <TableHead>
            <TableRow>
              <TableHeadCell className="sticky left-0 z-10 bg-gray-700">
                Sucursal
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer hover:bg-gray-700"
                onClick={() => requestSort("totalSales")}
              >
                Venta real {sortIcon("totalSales")}
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer text-right hover:bg-gray-700"
                onClick={() => requestSort("avgTicket")}
              >
                Ticket promedio {sortIcon("avgTicket")}
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer text-right hover:bg-gray-700"
                onClick={() => requestSort("totalSlaughtered")}
              >
                Pollo benef. (pzas) {sortIcon("totalSlaughtered")}
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer text-right hover:bg-gray-700"
                onClick={() => requestSort("expectedVariancePct")}
              >
                Cumplimiento kg {sortIcon("expectedVariancePct")}
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer text-right hover:bg-gray-700"
                onClick={() => requestSort("mermaQuantity")}
              >
                Merma total (kg) {sortIcon("mermaQuantity")}
              </TableHeadCell>
              <TableHeadCell
                className="cursor-pointer text-right hover:bg-gray-700"
                onClick={() => requestSort("daysWithReport")}
              >
                Cobertura {sortIcon("daysWithReport")}
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-gray-700">
            {sortedRows.map((row) => (
              <TableRow
                key={row.branchId}
                className="group cursor-pointer border-gray-700 bg-gray-800 hover:bg-gray-700"
                onClick={() => onSelectBranch(row.branchId, row.branchName)}
                tabIndex={0}
                aria-label={`Ver detalle de ${row.branchName}`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectBranch(row.branchId, row.branchName);
                  }
                }}
              >
                <TableCell className="sticky left-0 z-10 bg-inherit">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">
                      {row.branchName}
                    </span>
                    <ReviewBadge row={row} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-semibold text-white">
                        {formatMXN(row.totalSales)}
                      </span>
                      <DeltaBadge
                        value={row.salesDelta}
                        suffix="vs. anterior"
                      />
                    </div>
                    <ShareBar share={row.share} />
                  </div>
                </TableCell>
                <TableCell className="text-right text-white tabular-nums">
                  {formatMXN(row.avgTicket)}
                </TableCell>
                <TableCell className="text-right text-white tabular-nums">
                  {formatPieces(row.totalSlaughtered)}
                </TableCell>
                <TableCell className="text-right">
                  <ComplianceCell row={row} expectedError={expectedError} />
                </TableCell>
                <TableCell className="text-right text-white tabular-nums">
                  {formatQuantity(row.mermaQuantity)} kg
                </TableCell>
                <TableCell className="text-right">
                  <CoverageCell row={row} expectedDays={expectedDays} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {legend}
      </div>

      <div className="lg:hidden" data-testid="ranking-cards">
        <div className="space-y-3">
          {sortedRows.map((row) => (
            <div
              key={row.branchId}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalle de ${row.branchName}`}
              className="w-full cursor-pointer rounded-xl border border-gray-700 bg-gray-900/60 p-4 text-left transition hover:border-gray-500 focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:outline-none"
              onClick={() => onSelectBranch(row.branchId, row.branchName)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectBranch(row.branchId, row.branchName);
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">
                    {row.branchName}
                  </span>
                  <ReviewBadge row={row} />
                </div>
                <HiChevronRight className="h-5 w-5 flex-shrink-0 text-gray-500" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    Venta real
                  </p>
                  <p className="font-semibold text-white">
                    {formatMXN(row.totalSales)}
                  </p>
                  <DeltaBadge
                    value={row.salesDelta}
                    suffix="vs. anterior"
                    className="mt-1"
                  />
                  <ShareBar share={row.share} className="mt-1" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    Ticket promedio
                  </p>
                  <p className="text-white">{formatMXN(row.avgTicket)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    Pollo beneficiado
                  </p>
                  <p className="text-white">
                    {formatPieces(row.totalSlaughtered)} pzas
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    Merma total
                  </p>
                  <p className="text-white">
                    {formatQuantity(row.mermaQuantity)} kg
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="mb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    Cumplimiento kg
                  </p>
                  <ComplianceCell
                    row={row}
                    align="start"
                    expectedError={expectedError}
                  />
                </div>
                {row.expectedLoaded &&
                  row.expectedKg != null &&
                  row.expectedMoney != null &&
                  row.expectedReportedMoney != null && (
                    <div className="col-span-2">
                      <p className="mb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                        Venta mínima vs registrada
                      </p>
                      <div className="flex flex-wrap items-baseline gap-3 text-white">
                        <span>Mín. {formatMXN(row.expectedMoney)}</span>
                        <span>
                          Comp. {formatMXN(row.expectedReportedMoney)}
                        </span>
                      </div>
                      {row.expectedTotalReportedMoney != null &&
                        row.expectedTotalReportedMoney !==
                          row.expectedReportedMoney && (
                          <p className="text-xs text-gray-400">
                            Total registrado{" "}
                            {formatMXN(row.expectedTotalReportedMoney)}
                          </p>
                        )}
                      <p
                        className={`text-xs ${
                          moneyComparisonState(
                            row.expectedMoney,
                            row.expectedReportedMoney,
                          ) === "below"
                            ? "text-red-400"
                            : moneyComparisonState(
                                  row.expectedMoney,
                                  row.expectedReportedMoney,
                                ) === "within"
                              ? "text-amber-400"
                              : "text-green-400"
                        }`}
                      >
                        Diferencia {formatMoney(row.expectedMoneyDifference)}
                      </p>
                    </div>
                  )}
                <div className="col-span-2">
                  <p className="mb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    Cobertura
                  </p>
                  <CoverageCell
                    row={row}
                    expectedDays={expectedDays}
                    align="start"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {legend}
      </div>
    </Card>
  );
};
