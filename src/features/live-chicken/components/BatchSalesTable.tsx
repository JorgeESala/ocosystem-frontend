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
import InboundBatchSaleEntryForm from "./InboundBatchSaleEntryForm";
import { BatchSalesSummary } from "./BatchSalesSummary";

interface Props {
  sales: InboundBatchSale[];
  batch: InboundBatch;
}

export const BatchSalesTable: React.FC<Props> = ({ sales, batch }) => {
  const [selectedSale, setSelectedSale] = useState<InboundBatchSale | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEditSale = (sale: InboundBatchSale) => {
    setSelectedSale(sale);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedSale(null);
    setIsFormOpen(false);
  };

  if (sales.length === 0) {
    return <div className="py-2 text-center text-gray-400">Sin ventas</div>;
  }

  return (
    <div className="mt-2">
      {/* Desktop table */}
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
              <TableHeadCell>Promedio kg/pollo</TableHeadCell>
              <TableHeadCell>Precio promedio/kg</TableHeadCell>
              <TableHeadCell>Diferencia kg</TableHeadCell>
              <TableHeadCell>Acciones</TableHeadCell>
            </TableRow>
          </TableHead>

          <TableBody className="divide-y text-center">
            {sales.map((s) => {
              const avgKgPerChicken =
                s.quantitySold > 0 ? s.kgSold / s.quantitySold : 0;

              const avgPricePerKg = s.kgSold > 0 ? s.saleTotal / s.kgSold : 0;

              const kgDifference = s.kgSent - s.kgSold;

              return (
                <TableRow key={s.id}>
                  <TableCell>
                    {new Date(`${s.date}T00:00:00`).toLocaleDateString("es-MX")}
                  </TableCell>

                  <TableCell>{s.employeeName}</TableCell>
                  <TableCell>{s.routeName}</TableCell>

                  <TableCell>{s.quantitySold}</TableCell>

                  <TableCell>{s.kgSent.toFixed(2)} kg</TableCell>

                  <TableCell>{s.kgSold.toFixed(2)} kg</TableCell>

                  <TableCell>
                    ${Number(s.saleTotal).toLocaleString("es-MX")}
                  </TableCell>

                  <TableCell>{avgKgPerChicken.toFixed(3)} kg</TableCell>

                  <TableCell>${avgPricePerKg.toFixed(2)}</TableCell>

                  <TableCell>{kgDifference.toFixed(2)} kg</TableCell>

                  <TableCell>
                    <Button size="xs" onClick={() => handleEditSale(s)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && selectedSale && (
        <InboundBatchSaleEntryForm
          batch={batch}
          existingSale={selectedSale}
          onClose={handleCloseForm}
          onSuccess={() => {}}
        />
      )}

      <BatchSalesSummary batch={batch} sales={sales} />
    </div>
  );
};
