import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
} from "flowbite-react";

import type { BatchMovement, InboundBatch, InboundBatchSale } from "../types";
import { BatchSalesSummary } from "./BatchSalesSummary";
import type { ChickenLoss } from "../ChickenLoss/types/chickenLoss.types";

interface Props {
  batch: InboundBatch;
  movements: BatchMovement[];
  onEditSale: (sale: InboundBatchSale) => void;
  onEditLoss: (loss: ChickenLoss) => void;
}
export const BatchSalesTable: React.FC<Props> = ({
  movements,
  batch,
  onEditSale,
  onEditLoss,
}) => {
  if (movements.length === 0) {
    return (
      <div className="py-2 text-center text-gray-400">Sin movimientos</div>
    );
  }

  return (
    <div className="mt-2">
      <div className="hidden overflow-x-auto md:block">
        <Table striped>
          <TableHead>
            <TableRow className="text-center">
              <TableHeadCell>Fecha</TableHeadCell>
              <TableHeadCell>Chofer</TableHeadCell>
              <TableHeadCell>Ruta</TableHeadCell>
              <TableHeadCell>Pollos</TableHeadCell>
              <TableHeadCell>Kg vendidos</TableHeadCell>
              <TableHeadCell>Kg enviados</TableHeadCell>
              <TableHeadCell>Total</TableHeadCell>
              <TableHeadCell>Promedio kg/pollo</TableHeadCell>
              <TableHeadCell>Precio promedio/kg</TableHeadCell>
              <TableHeadCell>Diferencia kg</TableHeadCell>
              <TableHeadCell>Acciones</TableHeadCell>
            </TableRow>
          </TableHead>

          <TableBody className="divide-y text-center">
            {movements.map((m) => {
              if (m.type === "SALE") {
                const avgKgPerChicken =
                  m.type === "SALE" && m.quantity > 0
                    ? m.weight / m.quantity
                    : 0;

                const avgPricePerKg =
                  m.type === "SALE" && m.weight > 0 ? m.amount / m.weight : 0;

                const kgDifference =
                  m.type === "SALE" ? m.kgSent - m.weight : 0;

                return (
                  <TableRow key={`SALE-${m.id}`}>
                    <TableCell>{m.date.toLocaleDateString("es-MX")}</TableCell>

                    <TableCell>{m.employeeName}</TableCell>
                    <TableCell>{m.routeName}</TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell>{m.weight.toFixed(2)}</TableCell>
                    <TableCell>{m.kgSent.toFixed(2)}</TableCell>

                    <TableCell>
                      $
                      {m.amount.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell>{avgKgPerChicken.toFixed(3)}</TableCell>

                    <TableCell>
                      $
                      {avgPricePerKg.toLocaleString("es-MX", {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}
                    </TableCell>

                    <TableCell>{kgDifference.toFixed(2)}</TableCell>

                    <TableCell>
                      <Button size="xs" onClick={() => onEditSale(m.original)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }

              // LOSS
              return (
                <TableRow
                  key={`LOSS-${m.id}`}
                  className="bg-red-900/40 text-red-200"
                >
                  <TableCell>{m.date.toLocaleDateString("es-MX")}</TableCell>

                  <TableCell>—</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>{m.quantity}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>{m.weight.toFixed(2)}</TableCell>
                  <TableCell>
                    $
                    {m.amount.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>—</TableCell>

                  <TableCell>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => onEditLoss(m.original)}
                    >
                      Editar baja
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <BatchSalesSummary batch={batch} movements={movements} />
    </div>
  );
};
