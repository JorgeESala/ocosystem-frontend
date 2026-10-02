import { useMemo } from "react";
import {
  Badge,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import { DeltaBadge } from "./DeltaBadge";
import type { BranchRankingRow } from "../utils/consolidatedMetrics";

export type RankingSortKey =
  | "totalSales"
  | "avgTicket"
  | "totalSlaughtered"
  | "mermaQuantity"
  | "daysWithReport";

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
}

const formatNumber = (value: number) =>
  value.toLocaleString("es-MX", { maximumFractionDigits: 1 });

export const BranchRankingTable = ({
  rows,
  expectedDays,
  onSelectBranch,
  sort,
  onSortChange,
}: Props) => {
  const sortedRows = useMemo(() => {
    const items = [...rows];
    items.sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
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

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <h3 className="text-lg font-semibold text-gray-200">
          Ranking de sucursales
        </h3>
        <span className="text-xs text-gray-500">
          Haz clic en una sucursal para ver el detalle
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable className="dark">
          <TableHead>
            <TableHeadCell>Sucursal</TableHeadCell>
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-700"
              onClick={() => requestSort("totalSales")}
            >
              Venta real {sortIcon("totalSales")}
            </TableHeadCell>
            <TableHeadCell>
              Participación{" "}
              <InfoTip title="Participación">
                Porcentaje que aporta la sucursal a la Venta Real del grupo.
              </InfoTip>
            </TableHeadCell>
            <TableHeadCell>
              vs. periodo anterior{" "}
              <InfoTip title="vs. periodo anterior">
                Comparación contra la ventana anterior de la misma duración.
              </InfoTip>
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-700"
              onClick={() => requestSort("avgTicket")}
            >
              Ticket promedio {sortIcon("avgTicket")}
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-700"
              onClick={() => requestSort("totalSlaughtered")}
            >
              Pollo beneficiado {sortIcon("totalSlaughtered")}
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-700"
              onClick={() => requestSort("mermaQuantity")}
            >
              Merma {sortIcon("mermaQuantity")}
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-700"
              onClick={() => requestSort("daysWithReport")}
            >
              Días con reporte {sortIcon("daysWithReport")}
              <InfoTip title="Días con reporte">
                Días del periodo con reporte subido para esa sucursal. Los días
                faltantes se marcan en amarillo.
              </InfoTip>
            </TableHeadCell>
          </TableHead>
          <TableBody className="divide-y divide-gray-700">
            {sortedRows.map((row) => (
              <TableRow
                key={row.branchId}
                className="cursor-pointer border-gray-700 bg-gray-800"
                onClick={() => onSelectBranch(row.branchId, row.branchName)}
              >
                <TableCell className="font-medium text-white">
                  {row.branchName}
                </TableCell>
                <TableCell className="text-white">
                  {formatMXN(row.totalSales)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, row.share)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300">
                      {row.share.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DeltaBadge value={row.salesDelta} suffix="" />
                </TableCell>
                <TableCell className="text-white">
                  {formatMXN(row.avgTicket)}
                </TableCell>
                <TableCell className="text-white">
                  {formatNumber(row.totalSlaughtered)}
                </TableCell>
                <TableCell className="text-white">
                  {formatNumber(row.mermaQuantity)}
                </TableCell>
                <TableCell>
                  {row.missingDays > 0 ? (
                    <Badge color="warning" className="w-fit">
                      {row.daysWithReport}/{expectedDays} días
                    </Badge>
                  ) : (
                    <span className="text-xs font-semibold text-green-400">
                      {row.daysWithReport}/{expectedDays}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
