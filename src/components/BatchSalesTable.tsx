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
import { DailyBatchSale, type Batch } from "../services/api";
import { BatchSummary } from "./BatchSummary";
import SaleEntryForm from "./SaleEntryForm";

interface Props {
  sales: DailyBatchSale[];
  batch: Batch;
}

// --- Genera color dinámico del texto ---
function getMermaColor(value: number, target = 0.25) {
  const diff = value - target;

  if (Math.abs(diff) < 0.02) return "#E3A008"; // amarillo-400

  if (value < target) {
    const intensity = Math.min(1, (target - value) / target);
    const g = Math.floor(180 + intensity * 40);
    return `rgb(30, ${g}, 30)`; // verde dinámico
  }

  const intensity = Math.min(1, (value - target) / target);
  const r = Math.floor(180 + intensity * 40);
  return `rgb(${r}, 40, 40)`; // rojo dinámico
}

export const BatchSalesTable: React.FC<Props> = ({ sales, batch }) => {
  const [selectedSale, setSelectedSale] = useState<DailyBatchSale | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isCedis = batch.branchId === 6;

  const handleEditSale = (sale: DailyBatchSale) => {
    setSelectedSale(sale);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSale(null);
  };

  if (sales.length === 0) {
    return <div className="py-2 text-center text-gray-400">Sin ventas</div>;
  }

  return (
    <div className="mt-2">
      {/* Desktop: tabla */}
      <div className="hidden overflow-x-auto md:block">
        <Table striped>
          <TableHead>
            <TableRow className="text-center">
              <TableHeadCell>Fecha</TableHeadCell>
              <TableHeadCell>{isCedis ? "Cliente" : "Encargado"}</TableHeadCell>
              <TableHeadCell>Pollos Vendidos</TableHeadCell>
              <TableHeadCell>Kilos Vendidos</TableHeadCell>
              <TableHeadCell>Kilos de Tripa</TableHeadCell>
              <TableHeadCell>Total Venta</TableHeadCell>
              <TableHeadCell>Promedio de kg</TableHeadCell>
              <TableHeadCell>Precio promedio/kg</TableHeadCell>
              <TableHeadCell>Merma sin tripa</TableHeadCell>
              <TableHeadCell>Merma con tripa</TableHeadCell>
              <TableHeadCell>Acciones</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y text-center">
            {sales.map((s) => {
              const merma = batch.avgChickenWeight
                ? (s.quantitySold * batch.avgChickenWeight -
                    s.kgGut -
                    s.kgTotal) /
                  s.quantitySold
                : null;
              const mermaConTripa = batch.avgChickenWeight
                ? batch.avgChickenWeight - s.kgTotal / s.quantitySold
                : null;

              return (
                <TableRow key={s.date.toString()}>
                  <TableCell>
                    {new Date(`${s.date}T00:00:00`).toLocaleDateString("es-MX")}
                  </TableCell>
                  <TableCell>
                    {isCedis ? s.client?.name : s.employee?.name}
                  </TableCell>
                  <TableCell>{s.quantitySold}</TableCell>
                  <TableCell>{s.kgTotal.toFixed(2)} kg</TableCell>
                  <TableCell>{s.kgGut.toFixed(2)} kg</TableCell>
                  <TableCell>
                    ${Number(s.saleTotal).toLocaleString("es-MX")}
                  </TableCell>
                  <TableCell>
                    {(s.kgTotal / s.quantitySold).toFixed(3)} kg
                  </TableCell>
                  <TableCell>${(s.saleTotal / s.kgTotal).toFixed(3)}</TableCell>

                  <TableCell>
                    {merma !== null ? (
                      <span style={{ color: getMermaColor(merma) }}>
                        {merma.toFixed(3)} kg
                      </span>
                    ) : (
                      "Información incompleta"
                    )}
                  </TableCell>
                  <TableCell>
                    {mermaConTripa !== null ? (
                      <span style={{ color: getMermaColor(mermaConTripa) }}>
                        {mermaConTripa.toFixed(3)} kg
                      </span>
                    ) : (
                      "Información incompleta"
                    )}
                  </TableCell>

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

      {/* Mobile no lleva colores aquí, si lo quieres lo agrego */}
      <div className="space-y-2 md:hidden">
        {sales.map((s) => (
          <div
            key={s.date.toString()}
            className="rounded-md bg-gray-800 p-2 text-white shadow"
          >
            <div>
              Fecha:{" "}
              {new Date(`${s.date}T00:00:00`).toLocaleDateString("es-MX")}
            </div>
            <div>Pollos Vendidos: {s.quantitySold}</div>
            <div>Encargado: {s.employee?.name}</div>
            <div>Kilos Vendidos: {s.kgTotal.toFixed(2)} kg</div>
            <div>Kilos de Tripa: {s.kgGut.toFixed(2)} kg</div>
            <div>
              Total Venta: ${Number(s.saleTotal).toLocaleString("es-MX")}
            </div>
            <div>Promedio: {(s.kgTotal / s.quantitySold).toFixed(3)} kg</div>
            <div>Precio/kg: ${(s.saleTotal / s.kgTotal).toFixed(3)}</div>
          </div>
        ))}
      </div>

      {isFormOpen && selectedSale && (
        <SaleEntryForm
          batch={batch}
          existingSale={selectedSale}
          onClose={handleCloseForm}
          onSuccess={() => {}}
        />
      )}

      <BatchSummary batch={batch} sales={sales} />
    </div>
  );
};
