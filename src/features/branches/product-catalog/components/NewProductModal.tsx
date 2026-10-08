import { Alert, Button, Label, Modal, ModalBody, ModalHeader, Select, TextInput } from "flowbite-react";
import { useState } from "react";
import { useCategories } from "../../product/api/categories.queries";
import { useMeasurementUnits } from "../../product/api/measurementUnits.queries";
import { visibleCatalogEntries } from "../utils/catalog-filter";
import { useCreateProduct } from "../api/product-catalog.queries";
import { serverMessage } from "../utils/error-message";

export default function NewProductModal({ onClose }: { onClose: () => void }) {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const createProduct = useCreateProduct();
  const { data: categories = [] } = useCategories();
  const { data: units = [] } = useMeasurementUnits();

  const valid =
    barcode.trim() !== "" && name.trim() !== "" && categoryId !== "" && unitId !== "";

  const handleSave = () => {
    if (!valid) return;
    createProduct.mutate(
      {
        barcode: barcode.trim(),
        name: name.trim(),
        categoryId: Number(categoryId),
        unitId: Number(unitId),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal show onClose={onClose}>
      <ModalHeader>Nuevo producto</ModalHeader>
      <ModalBody>
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            El producto queda activo de inmediato y aparece en las sucursales
            tras sincronizar el catálogo.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Código de barras</Label>
              <TextInput
                placeholder="Código"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>
            <div>
              <Label>Nombre</Label>
              <TextInput
                placeholder="Nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Selecciona…</option>
                {visibleCatalogEntries(categories).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Unidad</Label>
              <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                <option value="">Selecciona…</option>
                {visibleCatalogEntries(units).map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {createProduct.isError && (
            <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
              {serverMessage(
                createProduct.error,
                "No se pudo crear el producto.",
              )}
            </Alert>
          )}
          <Button
            color="blue"
            disabled={!valid || createProduct.isPending}
            onClick={handleSave}
          >
            Crear producto
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
