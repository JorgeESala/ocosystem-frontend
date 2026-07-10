import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import type { BatchProfitDetail } from "../types";
import type { BusinessUnitType } from "@/features/batch/types.batch";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import { EggQuantityDisplay } from "@/features/batch/components/egg/EggQuantityDisplay";
import { BatchPreviewDrawer } from "@/features/batch/components/BatchPreviewDrawer";

interface Props {
  details: BatchProfitDetail[];
  unitType: BusinessUnitType;
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

type TooltipAlign = "left" | "center" | "right";

interface ColumnHeaderWithTooltipProps {
  label: string;
  align?: TooltipAlign;
  tooltipTitle: string;
  tooltipDesc: React.ReactNode;
}

const alignmentClasses: Record<TooltipAlign, string> = {
  left: "left-0",
  center: "left-1/2 -translate-x-1/2",
  right: "right-0",
};

const ColumnHeaderWithTooltip: React.FC<ColumnHeaderWithTooltipProps> = ({
  label,
  align = "center",
  tooltipTitle,
  tooltipDesc,
}) => (
  <TableHeadCell
    className={`bg-gray-900 text-gray-200 ${
      align === "right" ? "text-right" : ""
    }`}
  >
    <div
      className={`group relative inline-flex items-center gap-1 ${
        align === "right" ? "flex-row-reverse" : ""
      }`}
    >
      <span>{label}</span>
      <HiInformationCircle className="text-[11px] text-gray-500 transition-colors group-hover:text-blue-400" />
      <div
        className={`absolute top-full z-50 mt-1 hidden w-72 rounded-lg border border-gray-800 bg-gray-950 p-3 text-left text-[11px] leading-relaxed font-normal normal-case text-gray-300 shadow-xl group-hover:block ${alignmentClasses[align]}`}
      >
        <p className="mb-1 border-b border-gray-800 pb-1 font-semibold text-white">
          {tooltipTitle}
        </p>
        <div className="space-y-1.5">{tooltipDesc}</div>
      </div>
    </div>
  </TableHeadCell>
);

export const ProfitBatchTable: React.FC<Props> = ({ details, unitType }) => {
  const [previewBatchId, setPreviewBatchId] = useState<number | null>(null);

  if (details.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <p className="text-center text-sm text-gray-400">
          No hay remesas con ventas en este periodo.
        </p>
      </div>
    );
  }

  const first = details[0];
  const firstCostPerUnit =
    first.chickenQuantity && first.chickenQuantity > 0
      ? first.totalBatchCost / first.chickenQuantity
      : null;
  const firstMargin = first.totalSalesInRange - first.computedCostForRange;

  return (
    <>
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
      <Table striped>
        <TableHead>
          <TableRow>
            <ColumnHeaderWithTooltip
              label="Remesa"
              align="left"
              tooltipTitle="ID de remesa"
              tooltipDesc={
                <p>Identificador único de la remesa en el sistema.</p>
              }
            />
            <ColumnHeaderWithTooltip
              label="CEDIS"
              align="center"
              tooltipTitle="Centro de distribución"
              tooltipDesc={
                <p>
                  Almacén o CEDIS que recibió originalmente la remesa al
                  momento de su entrada.
                </p>
              }
            />
            <ColumnHeaderWithTooltip
              label="Entrada"
              align="center"
              tooltipTitle="Fecha de entrada"
              tooltipDesc={
                <p>Fecha en que la remesa fue registrada en el sistema.</p>
              }
            />
            <ColumnHeaderWithTooltip
              label="Vendidos"
              align="right"
              tooltipTitle="Unidades vendidas en el rango"
              tooltipDesc={
                <>
                  <p>
                    Cantidad de piezas o aves vendidas de esta remesa dentro
                    del periodo seleccionado. Para huevo se muestra como iconos
                    (cajas, casilleros y piezas).
                  </p>
                  <p className="mt-1 font-semibold text-gray-400">
                    Ejemplo real (remesa #{first.batchId}):
                  </p>
                  <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                    {formatNumber(first.quantitySoldInRange)}{" "}
                    {unitType === "EGG" ? "piezas" : "aves"}
                  </p>
                </>
              }
            />
            <ColumnHeaderWithTooltip
              label="Costo proporcional"
              align="right"
              tooltipTitle="Costo proporcional en rango"
              tooltipDesc={
                <>
                  <p>
                    Porción del costo total de la remesa que corresponde a las
                    unidades vendidas dentro del rango seleccionado.
                  </p>
                  <p className="mt-1 font-semibold text-gray-400">Fórmula:</p>
                  <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                    costoPorUnidad × cantidadVendidaEnRango
                  </p>
                  <p className="mt-1 font-semibold text-gray-400">
                    Ejemplo real (remesa #{first.batchId}):
                  </p>
                  {firstCostPerUnit !== null ? (
                    <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                      {formatMXN(firstCostPerUnit)} × {formatNumber(first.quantitySoldInRange)} = {formatMXN(first.computedCostForRange)}
                    </p>
                  ) : (
                    <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                      {formatMXN(first.computedCostForRange)}
                    </p>
                  )}
                </>
              }
            />
            <ColumnHeaderWithTooltip
              label="Ventas rango"
              align="right"
              tooltipTitle="Ventas en rango"
              tooltipDesc={
                <>
                  <p>
                    Total de ingresos generados por esta remesa durante el
                    periodo seleccionado.
                  </p>
                  <p className="mt-1 font-semibold text-gray-400">
                    Ejemplo real (remesa #{first.batchId}):
                  </p>
                  <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                    {formatMXN(first.totalSalesInRange)}
                  </p>
                </>
              }
            />
            <ColumnHeaderWithTooltip
              label="Costo total"
              align="right"
              tooltipTitle="Costo total de la remesa"
              tooltipDesc={
                <>
                  <p>
                    Costo completo de la remesa al momento de su entrada, sin
                    repartir. Este valor no cambia con el filtro de fechas.
                  </p>
                  <p className="mt-1 font-semibold text-gray-400">
                    Ejemplo real (remesa #{first.batchId}):
                  </p>
                  <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                    {formatMXN(first.totalBatchCost)}
                  </p>
                </>
              }
            />
            <ColumnHeaderWithTooltip
              label="Margen"
              align="right"
              tooltipTitle="Margen del rango"
              tooltipDesc={
                <>
                  <p>
                    Diferencia entre las ventas y el costo proporcional dentro
                    del rango. Positivo = ganancia, negativo = pérdida.
                  </p>
                  <p className="mt-1 font-semibold text-gray-400">Fórmula:</p>
                  <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                    Ventas rango - Costo proporcional
                  </p>
                  <p className="mt-1 font-semibold text-gray-400">
                    Ejemplo real (remesa #{first.batchId}):
                  </p>
                  <p className="rounded bg-gray-900 px-1 py-0.5 font-mono text-[10px] text-blue-400">
                    {formatMXN(first.totalSalesInRange)} - {formatMXN(first.computedCostForRange)} = {formatMXN(firstMargin)}
                  </p>
                </>
              }
            />
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {details.map((row) => {
            const margin = row.totalSalesInRange - row.computedCostForRange;
            const marginClass =
              margin >= 0 ? "text-emerald-300" : "text-rose-300";
            return (
              <TableRow
                key={row.batchId}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                <TableCell className="font-medium text-white">
                  <button
                    onClick={() => setPreviewBatchId(row.batchId)}
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    #{row.batchId}
                  </button>
                </TableCell>
                <TableCell className="text-gray-300">
                  {row.entityName}
                </TableCell>
                <TableCell className="text-gray-300">
                  {formatHumanDate(row.entryDate, "short")}
                </TableCell>
                <TableCell className="text-right">
                  {unitType === "EGG" ? (
                    <div className="flex justify-end">
                      <EggQuantityDisplay
                        totalPieces={row.quantitySoldInRange}
                        className="text-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-300">
                      {formatNumber(row.quantitySoldInRange)}{" "}
                      <span className="text-xs text-gray-500">aves</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-orange-300">
                  {formatMXN(row.computedCostForRange)}
                </TableCell>
                <TableCell className="text-right text-green-300">
                  {formatMXN(row.totalSalesInRange)}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatMXN(row.totalBatchCost)}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${marginClass}`}
                >
                  {formatMXN(margin)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    <BatchPreviewDrawer
      open={previewBatchId != null}
      onClose={() => setPreviewBatchId(null)}
      batchId={previewBatchId}
      unitType={unitType}
    />
    </>
  );
};
