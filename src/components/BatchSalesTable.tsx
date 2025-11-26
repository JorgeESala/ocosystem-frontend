import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Spinner,
  Alert,
  Button,
} from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { DailyBatchSale, fetchBatchSales, type Batch } from "../services/api";
import { BatchSummary } from "./BatchSummary";
import SaleEntryForm from "./SaleEntryForm";

interface Props {
  sales: DailyBatchSale[];
  batch: Batch;
}

export const BatchSalesTable: React.FC<Props> = ({ sales, batch }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWaste, setTotalWaste] = useState<number>(0);
  const [selectedSale, setSelectedSale] = useState<DailyBatchSale | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEditSale = (sale: DailyBatchSale) => {
    setSelectedSale(sale);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSale(null);
  };

  const handleSuccess = () => {
    fetchBatchSales();
  };

  useEffect(() => {
    const loadSales = async () => {
      try {
        // Calcula directamente con los datos recién obtenidos
        const totalQuantitySold = sales.reduce(
          (sum, s) => sum + s.quantitySold,
          0,
        );
        const totalKgSold = sales.reduce((sum, s) => sum + s.kgTotal, 0);
        const totalKgGut = sales.reduce((sum, s) => sum + s.kgGut, 0);

        setTotalWaste(
          totalWaste +
            (batch.avgChickenWeight * totalQuantitySold -
              totalKgSold -
              totalKgGut) /
              totalQuantitySold,
        );
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las ventas de esta remesa.");
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [batch.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner size="sm" aria-label="Cargando ventas..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure" icon={HiExclamation} className="my-2">
        <span className="font-medium">Error:</span> {error}
      </Alert>
    );
  }

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
              <TableHeadCell>Pollos Vendidos</TableHeadCell>
              <TableHeadCell>Kilos Vendidos</TableHeadCell>
              <TableHeadCell>Kilos de Tripa</TableHeadCell>
              <TableHeadCell>Total Venta</TableHeadCell>
              <TableHeadCell>Promedio de kg</TableHeadCell>
              <TableHeadCell>Precio promedio/kg</TableHeadCell>
              <TableHeadCell>Merma por pollo</TableHeadCell>
              <TableHeadCell>Acciones</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y text-center">
            {sales.map((s) => (
              <TableRow key={s.date.toString()}>
                <TableCell>
                  {new Date(`${s.date}T00:00:00`).toLocaleDateString("es-MX")}
                </TableCell>
                <TableCell>{s.quantitySold}</TableCell>
                <TableCell>{s.kgTotal.toFixed(2)} kg</TableCell>
                <TableCell>{s.kgGut.toFixed(2)} kg</TableCell>
                <TableCell>
                  ${Number(s.saleTotal).toLocaleString("es-MX")}
                </TableCell>
                <TableCell>
                  {Number(
                    (s.kgTotal / s.quantitySold).toFixed(3),
                  ).toLocaleString("es-MX")}{" "}
                  kg
                </TableCell>
                <TableCell>${(s.saleTotal / s.kgTotal).toFixed(3)}</TableCell>
                <TableCell>
                  {batch.avgChickenWeight
                    ? (
                        (s.quantitySold * batch.avgChickenWeight -
                          s.kgGut -
                          s.kgTotal) /
                        s.quantitySold
                      ).toFixed(3)
                    : "Información de la remesa incompleta"}{" "}
                  kg
                </TableCell>
                <TableCell>
                  <Button size="xs" onClick={() => handleEditSale(s)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {/* <TableRow>
              <TableCell>MERMA PROMEDIO</TableCell>
              <TableCell>{totalWaste} kg/pollo</TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
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
            <div>Kilos Vendidos: {s.kgTotal.toFixed(2)} kg</div>
            <div>Kilos de Tripa: {s.kgGut.toFixed(2)} kg</div>
            <div>
              Total Venta: ${Number(s.saleTotal).toLocaleString("es-MX")}
            </div>
            <div>
              Promedio de kg: {(s.kgTotal / s.quantitySold).toFixed(3)} kg
            </div>
            <div>
              Precio promedio/kg: $
              {Number((s.saleTotal / s.kgTotal).toFixed(3)).toLocaleString(
                "es-MX",
              )}
            </div>
          </div>
        ))}
      </div>
      {isFormOpen && selectedSale && (
        <SaleEntryForm
          batch={batch}
          existingSale={selectedSale}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}

      {/* Summary */}
      <BatchSummary batch={batch} sales={sales} />
    </div>
  );
};
