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
import { type Batch, type BranchesBatchSale } from "../../../services/api";
import { BatchSummary } from "./BatchSummary";
import SaleEntryForm from "../../../components/SaleEntryForm";
import { getCuentaKey } from "./utils/cuenta";

interface Props {
  sales: BranchesBatchSale[];
  batch: Batch;
  cuentaCounts: Map<string, number>;
  onToggleOfficeStatus: (
    saleId: number,
    currentStatus: boolean,
  ) => Promise<void>;
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

export const BatchSalesTable: React.FC<Props> = ({
  sales,
  batch,
  cuentaCounts,
  onToggleOfficeStatus,
}) => {
  const [selectedSale, setSelectedSale] = useState<BranchesBatchSale | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null); // -> NUEVO: Evita doble clic mientras procesa el backend
  const isCedis = batch.branchId === 6;

  const handleEditSale = (sale: BranchesBatchSale) => {
    setSelectedSale(sale);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSale(null);
  };

  const handleDotClick = async (saleId: number, currentStatus: boolean) => {
    if (currentStatus) {
      const confirmRevert = window.confirm(
        "¿Estás seguro de cambiar el estado a 'No recibido'? Esto reabrirá la edición de la venta.",
      );
      if (!confirmRevert) return;
    }

    try {
      setLoadingId(saleId);
      await onToggleOfficeStatus(saleId, currentStatus);
    } catch (error) {
      console.error("Error al actualizar estado de oficina", error);
    } finally {
      setLoadingId(null);
    }
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
              // Mantenemos tus fórmulas intactas
              const merma = batch.avgChickenWeight
                ? (s.quantitySold * batch.avgChickenWeight -
                    s.kgGut -
                    s.kgTotal) /
                  s.quantitySold
                : null;
              const mermaConTripa = batch.avgChickenWeight
                ? batch.avgChickenWeight - s.kgTotal / s.quantitySold
                : null;

              // -> NUEVO: Mapeo de estado para legibilidad de UI (Asumiendo que viene de tu BD)
              const isReceived = s.officeReceived ?? false;

              return (
                <TableRow key={s.id}>
                  {/* -> MODIFICADO: Agregamos el Status Dot al lado de la fecha */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDotClick(s.id, isReceived)}
                        disabled={loadingId === s.id}
                        title={
                          isReceived
                            ? "Cuenta recibida en oficina"
                            : "Cuenta no recibida"
                        }
                        className={`h-3 w-3 rounded-full transition-transform duration-150 hover:scale-125 focus:outline-none ${
                          loadingId === s.id
                            ? "animate-pulse cursor-wait bg-blue-400"
                            : isReceived
                              ? "cursor-pointer bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                              : "cursor-pointer bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        }`}
                      />
                      <span>
                        {new Date(`${s.date}T00:00:00`).toLocaleDateString(
                          "es-MX",
                        )}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {isCedis ? s.clientName : s.employeeName}
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

                  {/* -> MODIFICADO: Deshabilitar botón si ya fue recibido */}
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        size="xs"
                        onClick={() => handleEditSale(s)}
                        disabled={isReceived}
                        color={isReceived ? "gray" : "info"}
                      >
                        {isReceived ? "Bloqueado" : "Editar"}
                      </Button>
                      {(() => {
                        if (isReceived) return null;
                        const count = cuentaCounts.get(getCuentaKey(s, batch)) ?? 0;
                        if (count <= 1) return null;
                        return (
                          <span
                            className="rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] font-medium text-red-200"
                            title={`Parte de una cuenta con ${count} ventas. Márcala como recibida en la sección Cuentas pendientes.`}
                          >
                            Parte de cuenta ({count})
                          </span>
                        );
                      })()}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-2 md:hidden">
        {sales.map((s) => {
          const isReceived = s.officeReceived ?? false;
          return (
            <div
              key={s.id}
              className="relative rounded-md bg-gray-800 p-2 text-white shadow"
            >
              {/* -> NUEVO: Indicador visual rápido también en móvil (esquina superior derecha) */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${isReceived ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-[10px] text-gray-400">
                  {isReceived ? "Oficina" : "Pendiente"}
                </span>
              </div>

              <div>
                Fecha:{" "}
                {new Date(`${s.date}T00:00:00`).toLocaleDateString("es-MX")}
              </div>
              <div>Pollos Vendidos: {s.quantitySold}</div>
              <div>Encargado: {s.employeeName || "No asignado"}</div>
              <div>Kilos Vendidos: {s.kgTotal.toFixed(2)} kg</div>
              <div>Kilos de Tripa: {s.kgGut.toFixed(2)} kg</div>
              <div>
                Total Venta: ${Number(s.saleTotal).toLocaleString("es-MX")}
              </div>
              <div>Promedio: {(s.kgTotal / s.quantitySold).toFixed(3)} kg</div>
              <div>Precio/kg: ${(s.saleTotal / s.kgTotal).toFixed(3)}</div>
            </div>
          );
        })}
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
