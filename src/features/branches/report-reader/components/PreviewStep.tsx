import { useState } from "react";
import {
  Card,
  Button,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Select,
} from "flowbite-react";
import type { SalesImportPreviewDTO } from "../types";
import { useCategories } from "../../product/api/categories.queries";
import { useMeasurementUnits } from "../../product/api/measurementUnits.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
interface PreviewStepProps {
  data: SalesImportPreviewDTO;
  onBack: () => void;
  onConfirm: (payload: ConfirmPayload) => void;
}

interface ConfirmPayload {
  previewId: number;
  newProducts: {
    barcode: string;
    name: string;
    categoryId: number | null;
    unitId: number;
  }[];
}

export const PreviewStep = ({ data, onBack, onConfirm }: PreviewStepProps) => {
  const [editedProducts, setEditedProducts] = useState(
    data.newProducts.map((p) => ({
      barcode: p.barcode,
      name: p.suggestedName,
      categoryId: p.suggestedCategoryId,
      unitId: p.suggestedUnitId,
    })),
  );
  const {
    data: categories,
    isLoading: isLoadingCat,
    isError: isErrorCat,
  } = useCategories();
  const {
    data: units,
    isLoading: isLoadingUnit,
    isError: isErrorUnit,
  } = useMeasurementUnits();

  if (isLoadingUnit) return <p>Cargando unidades...</p>;
  if (isErrorUnit) return <p>Error al cargar unidades</p>;
  if (isLoadingCat) return <p>Cargando categorías...</p>;
  if (isErrorCat) return <p>Error al cargar categorías</p>;

  const hasInvalidProducts = editedProducts.some(
    (p) => !p.name || p.name.trim() === "",
  );

  const handleConfirm = () => {
    onConfirm({
      previewId: data.previewId,
      newProducts: editedProducts,
    });
  };

  return (
    <div className="space-y-6">
      {/* 🔹 Resumen General */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold">Resumen del reporte</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total tickets</p>
            <p className="text-xl font-bold">{data.totalTickets}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total monto</p>
            <p className="text-xl font-bold">{formatMXN(data.totalAmount)}</p>
          </div>
        </div>
      </Card>

      {/* 🔹 Resumen por archivo */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold">Archivos procesados</h3>

        <Table>
          <TableHead>
            <TableHeadCell>Archivo</TableHeadCell>
            <TableHeadCell>Fecha</TableHeadCell>
            <TableHeadCell>Tickets</TableHeadCell>
            <TableHeadCell>Monto</TableHeadCell>
          </TableHead>
          <TableBody>
            {data.files.map((file) => (
              <TableRow key={file.fileName}>
                <TableCell>{file.fileName}</TableCell>
                <TableCell>{formatHumanDate(file.date)}</TableCell>
                <TableCell>{file.ticketCount}</TableCell>
                <TableCell>{formatMXN(file.totalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* 🔹 Productos nuevos */}
      {data.newProducts.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-yellow-600">
            Productos nuevos detectados
          </h3>

          <Table>
            <TableHead>
              <TableHeadCell>Código</TableHeadCell>
              <TableHeadCell>Nombre</TableHeadCell>
              <TableHeadCell>Unidad de medida</TableHeadCell>
              <TableHeadCell>Categoría</TableHeadCell>
            </TableHead>

            <TableBody>
              {editedProducts.map((product, index) => (
                <TableRow key={product.barcode}>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={product.name}
                      onChange={(e) =>
                        setEditedProducts((prev) =>
                          prev.map((p, i) =>
                            i === index ? { ...p, name: e.target.value } : p,
                          ),
                        )
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Select
                      required
                      id="measurementUnit"
                      value={product.unitId ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditedProducts((prev) =>
                          prev.map((p, i) =>
                            i === index ? { ...p, unitId: Number(value) } : p,
                          ),
                        );
                      }}
                    >
                      <option value="">Selecciona una unidad de medida</option>

                      {units?.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select
                      required
                      id="category"
                      value={product.categoryId ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditedProducts((prev) =>
                          prev.map((p, i) =>
                            i === index
                              ? {
                                  ...p,
                                  categoryId: value ? Number(value) : null,
                                }
                              : p,
                          ),
                        );
                      }}
                    >
                      <option value="">Selecciona una categoría</option>

                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 🔹 Botones */}
      <div className="flex justify-between">
        <Button color="gray" onClick={onBack}>
          Volver
        </Button>

        <Button
          color="blue"
          disabled={hasInvalidProducts}
          onClick={handleConfirm}
        >
          Confirmar e insertar
        </Button>
      </div>
    </div>
  );
};
