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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import type { SalesImportPreviewDTO } from "../types";
import { useCategories } from "../../product/api/categories.queries";
import { useMeasurementUnits } from "../../product/api/measurementUnits.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
interface PreviewStepProps {
  data: SalesImportPreviewDTO;
  onBack: () => void;
  onConfirm: (payload: ConfirmPayload) => Promise<void>;
}

interface ConfirmPayload {
  previewId: number;
  newProducts: {
    barcode: string;
    name: string;
    categoryId: number | null;
    unitId: number;
  }[];
  confirmedMissingCategories: boolean;
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
  const [missingConfirmed, setMissingConfirmed] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
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
  const [isConfirming, setIsConfirming] = useState(false);

  const missingCategories = data.missingCategories ?? [];

  if (isLoadingUnit) return <p>Cargando unidades...</p>;
  if (isErrorUnit) return <p>Error al cargar unidades</p>;
  if (isLoadingCat) return <p>Cargando categorías...</p>;
  if (isErrorCat) return <p>Error al cargar categorías</p>;

  const hasInvalidProducts = editedProducts.some(
    (p) =>
      !p.name ||
      p.name.trim() === "" ||
      p.categoryId === null ||
      p.categoryId === undefined,
  );

  const doConfirm = async (confirmedMissing: boolean) => {
    try {
      setIsConfirming(true);

      await onConfirm({
        previewId: data.previewId,
        newProducts: editedProducts,
        confirmedMissingCategories: confirmedMissing,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirm = () => {
    if (missingCategories.length > 0 && !missingConfirmed) {
      setShowMissingModal(true);
      return;
    }

    doConfirm(missingConfirmed);
  };

  const handleConfirmMissing = () => {
    setShowMissingModal(false);
    setMissingConfirmed(true);
    doConfirm(true);
  };

  return (
    <div className="space-y-6">
      {missingCategories.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <h3 className="text-lg font-semibold text-red-700">
            Reporte sin categorías obligatorias
          </h3>
          <p className="text-sm text-red-600">
            Este reporte no contiene ventas de{" "}
            <strong>{missingCategories.join(", ")}</strong>. Todo reporte debe
            incluir al menos una venta de merma y de matados. Confirma si
            deseas guardarlo de todos modos.
          </p>
        </Card>
      )}

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

      {data.newProducts.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-yellow-600">
            Productos nuevos detectados
          </h3>

          <Table className="w-full table-fixed">
            <TableHead>
              <TableHeadCell className="w-[15%]">Código</TableHeadCell>
              <TableHeadCell className="w-[45%]">Nombre</TableHeadCell>
              <TableHeadCell className="w-[20%]">
                Unidad de medida
              </TableHeadCell>
              <TableHeadCell className="w-[20%]">Categoría</TableHeadCell>
            </TableHead>

            <TableBody>
              {editedProducts.map((product, index) => (
                <TableRow key={product.barcode}>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>
                    <input
                      className="w-full rounded border"
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

      <div className="flex justify-between">
        <Button color="gray" onClick={onBack}>
          Volver
        </Button>

        <Button
          color="blue"
          disabled={hasInvalidProducts || isConfirming}
          onClick={handleConfirm}
        >
          {isConfirming ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Procesando...
            </span>
          ) : (
            "Confirmar e insertar"
          )}
        </Button>
      </div>

      <Modal show={showMissingModal} onClose={() => setShowMissingModal(false)}>
        <ModalHeader>Reporte sin categorías obligatorias</ModalHeader>
        <ModalBody>
          <p>
            El reporte no contiene ventas de{" "}
            <strong>{missingCategories.join(", ")}</strong>. Todo reporte debe
            incluir al menos una venta de merma y de matados. ¿Deseas guardarlo
            de todos modos?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setShowMissingModal(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={handleConfirmMissing}>
            Guardar de todos modos
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};