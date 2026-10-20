import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import type { RutaResumen } from "../types/income-statement.types";

interface Props {
  rutas: RutaResumen[];
}

export const RouteBreakdownTable: React.FC<Props> = ({ rutas }) => {
  if (rutas.length === 0) return null;

  const pct = (part: number, total: number): string => {
    if (!total) return "—";
    return `${((part / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800">
      <div className="border-b border-gray-700 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          Ventas y costo por ruta
          <InfoTip title="¿Cómo se calcula el margen?">
            <p className="font-mono text-[10px] text-blue-400">
              margen = ventas - costo - combustible
            </p>
            <p className="mt-1">
              Contribución de cada ruta después de su costo prorrateado de
              remesa y su gasto de combustible. Las ventas sin ruta asignada
              aparecen como &quot;Sin ruta&quot;.
            </p>
          </InfoTip>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <Table striped>
          <TableHead>
            <TableRow>
              <TableHeadCell>Ruta</TableHeadCell>
              <TableHeadCell className="text-right">Ventas</TableHeadCell>
              <TableHeadCell className="text-right">Costo</TableHeadCell>
              <TableHeadCell className="text-right">Combustible</TableHeadCell>
              <TableHeadCell className="text-right">Margen</TableHeadCell>
              <TableHeadCell className="text-right">% margen</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rutas.map((ruta) => (
              <TableRow key={ruta.rutaId ?? "sin-ruta"}>
                <TableCell className="font-medium text-white">
                  {ruta.rutaNombre}
                </TableCell>
                <TableCell className="text-right text-gray-200 tabular-nums">
                  {formatMXN(ruta.ventas)}
                </TableCell>
                <TableCell className="text-right text-gray-300 tabular-nums">
                  {formatMXN(ruta.costo)}
                </TableCell>
                <TableCell className="text-right text-gray-300 tabular-nums">
                  {formatMXN(ruta.combustible)}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold tabular-nums ${
                    ruta.margen >= 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {formatMXN(ruta.margen)}
                </TableCell>
                <TableCell className="text-right text-gray-300 tabular-nums">
                  {pct(ruta.margen, ruta.ventas)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
