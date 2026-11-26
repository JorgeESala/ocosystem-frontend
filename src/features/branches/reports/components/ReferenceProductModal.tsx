import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Spinner,
} from "flowbite-react";
import { useProductCatalog } from "@/features/branches/product-catalog/api/product-catalog.queries";
import { serverMessage } from "@/features/branches/product-catalog/utils/error-message";
import { formatFullDate, toLocalDateString } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import {
  useDeleteReferenceProduct,
  useReferenceProducts,
  useUpdateReferenceProduct,
} from "../api/expectedSales.queries";
import { isKgUnitName } from "../utils/expectedSales";

interface Props {
  asOf: Date;
  onClose: () => void;
}

export const ReferenceProductModal = ({ asOf, onClose }: Props) => {
  const asOfString = toLocalDateString(asOf);
  const referenceQuery = useReferenceProducts(asOfString);
  const catalogQuery = useProductCatalog();
  const update = useUpdateReferenceProduct();
  const remove = useDeleteReferenceProduct();
  const [savingBranchId, setSavingBranchId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const productOptions = useMemo(() => {
    return (catalogQuery.data ?? [])
      .filter(
        (product) =>
          product.isCanonical &&
          product.status === "ACTIVE" &&
          product.categoryName?.trim().toLowerCase() === "pollo" &&
          isKgUnitName(product.unitName),
      )
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }, [catalogQuery.data]);

  const handleChange = async (
    branchId: number,
    branchName: string,
    barcode: string,
  ) => {
    if (!barcode) {
      const confirmed = window.confirm(
        `¿Quitar el producto de referencia de ${branchName}?`,
      );
      if (!confirmed) return;
    }

    setActionError(null);
    setSavingBranchId(branchId);
    try {
      if (barcode) {
        await update.mutateAsync({ branchId, productBarcode: barcode });
      } else {
        await remove.mutateAsync(branchId);
      }
    } catch (error) {
      setActionError(
        serverMessage(error, "No se pudo guardar el producto de referencia."),
      );
    } finally {
      setSavingBranchId(null);
    }
  };

  const rows = referenceQuery.data ?? [];
  const isLoading =
    (referenceQuery.isLoading && !referenceQuery.data) ||
    (catalogQuery.isLoading && !catalogQuery.data);

  return (
    <Modal show onClose={onClose} size="4xl">
      <ModalHeader>Producto de referencia por sucursal</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Elige el pollo vendido por kilo que se usa como precio mínimo. Se
            toma el último precio de venta registrado para cada día del reporte.
          </p>

          <Alert color="info">
            Elige el producto más barato de la sucursal. Si eliges un corte, el
            mínimo queda más alto que el piso real.
          </Alert>

          {referenceQuery.isError && (
            <Alert color="failure">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>No se pudieron cargar los productos de referencia.</span>
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => void referenceQuery.refetch()}
                >
                  Reintentar
                </Button>
              </div>
            </Alert>
          )}

          {catalogQuery.isError && (
            <Alert color="warning">
              No se pudo cargar el catálogo de productos.
            </Alert>
          )}

          {actionError && <Alert color="failure">{actionError}</Alert>}

          {!catalogQuery.isLoading &&
            !catalogQuery.isError &&
            productOptions.length === 0 && (
              <Alert color="warning">
                No hay productos de pollo vendidos por kilo en el catálogo.
              </Alert>
            )}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No hay sucursales activas para configurar.
            </p>
          ) : (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {rows.map((row) => {
                const configuredOption = productOptions.find(
                  (product) => product.barcode === row.productBarcode,
                );
                return (
                  <div
                    key={row.branchId}
                    className="rounded-xl border border-gray-700 bg-gray-900/40 p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {row.branchName}
                        </p>
                        {row.pricePerKg != null ? (
                          <p className="text-xs text-gray-400">
                            {formatMXN(row.pricePerKg)} / kg · Precio al cierre
                            del reporte{" "}
                            {row.priceAsOf
                              ? formatFullDate(row.priceAsOf)
                              : "sin fecha"}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-400">
                            Sin precio de venta registrado
                          </p>
                        )}
                      </div>
                      {savingBranchId === row.branchId && <Spinner size="sm" />}
                    </div>

                    <Select
                      aria-label={`Producto de referencia de ${row.branchName}`}
                      data-testid={`reference-product-select-${row.branchId}`}
                      className="mt-2"
                      sizing="sm"
                      value={row.productBarcode ?? ""}
                      disabled={savingBranchId != null}
                      onChange={(event) =>
                        void handleChange(
                          row.branchId,
                          row.branchName,
                          event.target.value,
                        )
                      }
                    >
                      <option value="">Sin producto de referencia</option>
                      {productOptions.map((product) => (
                        <option key={product.barcode} value={product.barcode}>
                          {product.name} · {product.barcode}
                        </option>
                      ))}
                      {row.productBarcode && !configuredOption && (
                        <option value={row.productBarcode}>
                          {row.productName ?? row.productBarcode} ·{" "}
                          {row.productBarcode}
                        </option>
                      )}
                    </Select>

                    {row.productBarcode && !configuredOption && (
                      <p className="mt-1 text-xs text-gray-500">
                        El producto configurado ya no está disponible en el
                        catálogo de pollo por kilo.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-gray-500">
            Solo aparecen productos de la categoría Pollo con unidad de kilo.
          </p>
        </div>
      </ModalBody>
    </Modal>
  );
};
