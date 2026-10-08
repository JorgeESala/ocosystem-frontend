import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import { useMemo, useState } from "react";
import { useLinkProduct } from "../api/product-catalog.queries";
import type { CatalogProductRow } from "../types";
import { serverMessage } from "../utils/error-message";

interface Props {
  product: CatalogProductRow;
  products: CatalogProductRow[];
  onClose: () => void;
}

export default function LinkProductModal({
  product,
  products,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<CatalogProductRow | null>(null);
  const link = useLinkProduct();

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter(
        (candidate) =>
          candidate.barcode !== product.barcode &&
          candidate.sku !== product.sku &&
          (q === "" ||
            candidate.name.toLowerCase().includes(q) ||
            candidate.barcode.toLowerCase().includes(q)),
      )
      .slice(0, 30);
  }, [products, query, product]);

  const codesOf = (row: CatalogProductRow) =>
    products.filter((candidate) => candidate.sku === row.sku);

  const sourceCodes = codesOf(product);
  const targetCodes = target ? codesOf(target) : [];

  const handleLink = async () => {
    if (!target) return;
    try {
      await link.mutateAsync({
        targetBarcode: target.barcode,
        barcodes: [product.barcode],
      });
      onClose();
    } catch {
      // el error se muestra debajo
    }
  };

  const errorMessage = serverMessage(link.error, "No se pudo vincular.");
  const categoryChanged =
    target !== null &&
    product.categoryName !== null &&
    target.categoryName !== null &&
    product.categoryName !== target.categoryName;

  return (
    <Modal show onClose={onClose} size="md">
      <ModalHeader>Vincular "{product.name}" a otro producto</ModalHeader>
      <ModalBody>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Busca el producto principal. Este código quedará como variante: se
            conserva su código y su historial, y los reportes sumarán ambos.
          </p>
          <TextInput
            aria-label="Buscar producto principal"
            placeholder="Buscar por código o nombre"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="max-h-64 divide-y divide-gray-700 overflow-y-auto">
            {candidates.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500">
                Sin coincidencias.
              </p>
            ) : (
              candidates.map((candidate) => (
                <button
                  key={candidate.barcode}
                  type="button"
                  onClick={() => setTarget(candidate)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-700 ${
                    target?.barcode === candidate.barcode ? "bg-gray-700" : ""
                  }`}
                >
                  <span>{candidate.name}</span>
                  <span className="font-mono text-xs text-gray-400">
                    {candidate.barcode}
                  </span>
                </button>
              ))
            )}
          </div>
          {target && sourceCodes.length > 1 && (
            <Alert color="warning">
              "{product.name}" tiene {sourceCodes.length} códigos en el catálogo
              y se moverán todos al producto destino.
            </Alert>
          )}
          {target && targetCodes.length > 1 && (
            <Alert color="warning">
              El producto destino ya tiene {targetCodes.length} códigos: los de
              este producto se unirán a ellos.
            </Alert>
          )}
          {target && categoryChanged && (
            <Alert color="warning">
              Categorías distintas: pasa de {product.categoryName} a{" "}
              {target.categoryName}. Los reportes usarán la del producto
              destino.
            </Alert>
          )}
          {link.isError && <Alert color="failure">{errorMessage}</Alert>}
          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button disabled={!target || link.isPending} onClick={handleLink}>
              {link.isPending ? "Vinculando..." : "Vincular"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
