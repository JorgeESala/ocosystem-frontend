import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
} from "flowbite-react";

import type { InboundBatch, InboundBatchSale } from "../types";
import { BatchSalesSummary } from "./BatchSalesSummary";

interface Props {
  sales: InboundBatchSale[];
  batch: InboundBatch;
  onEditSale: (sale: InboundBatchSale) => void;
}

export const BatchSalesTable: React.FC<Props> = ({
  sales,
  batch,
  onEditSale,
}) => {
  if (sales.length === 0) {
    return <div className="py-2 text-center text-gray-400">Sin ventas</div>;
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
              <TableHeadCell>Pollos vendidos</TableHeadCell>
              <TableHeadCell>Kg enviados</TableHeadCell>
              <TableHeadCell>Kg vendidos</TableHeadCell>
              <TableHeadCell>Total venta</TableHeadCell>
              <TableHeadCell>Acciones</TableHeadCell>
            </TableRow>
          </TableHead>

          <TableBody className="divide-y text-center">
            {sales.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  {new Date(`${s.date}T00:00:00`).toLocaleDateString("es-MX")}
                </TableCell>
                <TableCell>{s.employeeName}</TableCell>
                <TableCell>{s.routeName}</TableCell>
                <TableCell>{s.quantitySold}</TableCell>
                <TableCell>{s.kgSent.toFixed(2)}</TableCell>
                <TableCell>{s.kgSold.toFixed(2)}</TableCell>
                <TableCell>
                  ${Number(s.saleTotal).toLocaleString("es-MX")}
                </TableCell>
                <TableCell>
                  <Button size="xs" onClick={() => onEditSale(s)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BatchSalesSummary batch={batch} sales={sales} />
    </div>
  );
};
