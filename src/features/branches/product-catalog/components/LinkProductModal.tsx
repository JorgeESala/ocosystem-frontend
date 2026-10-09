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

  const codeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of products) {
      counts.set(row.sku, (counts.get(row.sku) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter(
        (candidate) =>
          candidate.isCanonical &&
          candidate.sku !== product.sku &&
          (q === "" ||
            candidate.name.toLowerCase().includes(q) ||
            candidate.barcode.toLowerCase().includes(q)),
      )
      .slice(0, 30);
  }, [products, query, product]);

  const sourceCount = codeCounts.get(product.sku) ?? 1;
  const targetCount = target ? (codeCounts.get(target.sku) ?? 1) : 0;

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
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-gray-100 hover:bg-gray-700 ${
                    target?.barcode === candidate.barcode ? "bg-gray-700" : ""
                  }`}
                >
                  <span>{candidate.name}</span>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    {(codeCounts.get(candidate.sku) ?? 1) > 1 && (
                      <span>{codeCounts.get(candidate.sku)} códigos</span>
                    )}
                    <span className="font-mono">{candidate.barcode}</span>
                  </span>
                </button>
              ))
            )}
          </div>
          {target && sourceCount > 1 && (
            <Alert color="warning">
              "{product.name}" tiene {sourceCount} códigos en el catálogo y se
              moverán todos al producto destino.
            </Alert>
          )}
          {target && targetCount > 1 && (
            <Alert color="warning">
              El producto destino ya tiene {targetCount} códigos: los de este
              producto se unirán a ellos.
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
