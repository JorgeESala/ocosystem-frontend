import {
  Alert,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { useCategories } from "../../product/api/categories.queries";
import { useMeasurementUnits } from "../../product/api/measurementUnits.queries";
import {
  useCreateProduct,
  useUpdateProduct,
} from "../api/product-catalog.queries";
import type { CatalogProductRow } from "../types";
import { serverMessage } from "../utils/error-message";
import { visibleCatalogEntries } from "../utils/catalog-filter";

interface Props {
  onClose: () => void;
  product?: CatalogProductRow;
  canonicalBarcode?: string;
}

export default function ProductFormModal({
  onClose,
  product,
  canonicalBarcode,
}: Props) {
  const isEdit = product !== undefined;
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.categoryId != null ? String(product.categoryId) : "",
  );
  const [unitId, setUnitId] = useState(
    product?.unitId != null ? String(product.unitId) : "",
  );
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const { data: units = [] } = useMeasurementUnits();

  const valid =
    (isEdit || barcode.trim() !== "") &&
    name.trim() !== "" &&
    categoryId !== "" &&
    unitId !== "";
  const pending = isEdit ? updateProduct.isPending : createProduct.isPending;
  const failed = isEdit ? updateProduct.isError : createProduct.isError;
  const failure = isEdit ? updateProduct.error : createProduct.error;

  const handleSave = () => {
    if (!valid) return;
    const trimmedDescription =
      description.trim() === "" ? null : description.trim();
    if (isEdit) {
      updateProduct.mutate(
        {
          barcode: product.barcode,
          payload: {
            name: name.trim(),
            description: trimmedDescription,
            categoryId: Number(categoryId),
            unitId: Number(unitId),
          },
        },
        { onSuccess: onClose },
      );
      return;
    }
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
      <ModalHeader>{isEdit ? "Editar producto" : "Nuevo producto"}</ModalHeader>
      <ModalBody>
        <div className="space-y-3">
          {isEdit ? (
            <p className="text-sm text-slate-400">
              {product.isCanonical
                ? "Los reportes históricos se reclasificarán con la categoría que elijas."
                : `Este código es una variante. Los reportes usan la categoría del producto principal${
                    canonicalBarcode ? ` (${canonicalBarcode})` : ""
                  }.`}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              El producto queda activo de inmediato y aparece en las sucursales
              tras sincronizar el catálogo.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Código de barras</Label>
              {isEdit ? (
                <p className="font-mono text-sm text-white">
                  {product?.barcode}
                </p>
              ) : (
                <TextInput
                  placeholder="Código"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              )}
            </div>
            <div>
              <Label>Nombre</Label>
              <TextInput
                placeholder="Nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label>Descripción</Label>
              <TextInput
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
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
              <Select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              >
                <option value="">Selecciona…</option>
                {visibleCatalogEntries(units).map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {failed && (
            <Alert
              color="failure"
              className="border border-red-900/40 bg-red-950/40"
            >
              {serverMessage(
                failure,
                isEdit
                  ? "No se pudo actualizar el producto."
                  : "No se pudo crear el producto.",
              )}
            </Alert>
          )}
          <Button
            color="blue"
            disabled={!valid || pending}
            onClick={handleSave}
          >
            {isEdit ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
