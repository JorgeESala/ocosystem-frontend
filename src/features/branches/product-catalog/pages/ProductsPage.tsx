import {
  Alert,
  Badge,
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";
import { useMemo, useState } from "react";
import {
  useProductCatalog,
  useUnlinkProduct,
} from "../api/product-catalog.queries";
import LinkProductModal from "../components/LinkProductModal";
import ProductFormModal from "../components/ProductFormModal";
import type { CatalogProductRow } from "../types";
import { serverMessage } from "../utils/error-message";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [linking, setLinking] = useState<CatalogProductRow | null>(null);
  const [editing, setEditing] = useState<CatalogProductRow | null>(null);
  const { data: products = [], isLoading, isError } = useProductCatalog();
  const unlink = useUnlinkProduct();

  const codeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.sku, (counts.get(product.sku) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const canonicalBySku = useMemo(() => {
    const canonical = new Map<string, string>();
    for (const product of products) {
      if (product.isCanonical) canonical.set(product.sku, product.barcode);
    }
    return canonical;
  }, [products]);

  const matches = useMemo(() => {
    const filtered =
      query.trim() === ""
        ? [...products]
        : products.filter(
            (product) =>
              product.barcode
                .toLowerCase()
                .includes(query.trim().toLowerCase()) ||
              product.name.toLowerCase().includes(query.trim().toLowerCase()),
          );
    return filtered.sort((left, right) => {
      const leftProduct = canonicalBySku.get(left.sku) ?? left.sku;
      const rightProduct = canonicalBySku.get(right.sku) ?? right.sku;
      if (leftProduct !== rightProduct)
        return leftProduct.localeCompare(rightProduct);
      if (left.isCanonical !== right.isCanonical) {
        return left.isCanonical ? -1 : 1;
      }
      return left.name.localeCompare(right.name, "es");
    });
  }, [products, query, canonicalBySku]);

  const handleUnlink = async (barcode: string) => {
    if (
      !window.confirm(
        "¿Desvincular este código? Los reportes dejarán de sumarlo con el producto principal.",
      )
    ) {
      return;
    }
    try {
      await unlink.mutateAsync(barcode);
    } catch {
      // el error se muestra debajo
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Productos</h1>
          <p className="text-sm text-slate-400">
            Catálogo de piezas. Vincula códigos del mismo producto (promos,
            erratas, empaques) para que los reportes los sumen como uno.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>Nuevo producto</Button>
      </header>

      <TextInput
        placeholder="Buscar por código o nombre"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      {unlink.isError && (
        <Alert color="failure">
          {serverMessage(unlink.error, "No se pudo desvincular.")}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-400">No se pudo cargar el catálogo.</p>
      ) : matches.length === 0 ? (
        <p className="text-sm text-slate-400">
          Sin coincidencias en el catálogo.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>Código</TableHeadCell>
              <TableHeadCell>Nombre</TableHeadCell>
              <TableHeadCell>Categoría</TableHeadCell>
              <TableHeadCell>Unidad</TableHeadCell>
              <TableHeadCell>Estado</TableHeadCell>
              <TableHeadCell>Códigos</TableHeadCell>
              <TableHeadCell>
                <span className="sr-only">Acciones</span>
              </TableHeadCell>
            </TableHead>
            <TableBody>
              {matches.map((product, index) => {
                const codeCount = codeCounts.get(product.sku) ?? 1;
                const startsProduct =
                  codeCount > 1 &&
                  (index === 0 || matches[index - 1].sku !== product.sku);
                return (
                  <TableRow
                    key={product.barcode}
                    className={
                      startsProduct ? "border-t border-slate-700" : undefined
                    }
                  >
                    <TableCell className="font-mono">
                      {product.barcode}
                    </TableCell>
                    <TableCell>
                      {product.name}
                      {product.isCanonical ? (
                        codeCount > 1 && (
                          <Badge
                            color="success"
                            className="ml-2 inline-flex w-fit"
                          >
                            principal
                          </Badge>
                        )
                      ) : (
                        <>
                          <Badge
                            color="indigo"
                            className="ml-2 inline-flex w-fit"
                          >
                            variante
                          </Badge>
                          <span className="ml-2 text-xs whitespace-nowrap text-slate-500">
                            de {canonicalBySku.get(product.sku) ?? product.sku}
                          </span>
                        </>
                      )}
                    </TableCell>
                    <TableCell>{product.categoryName ?? "-"}</TableCell>
                    <TableCell>{product.unitName ?? "-"}</TableCell>
                    <TableCell>
                      {product.status === "ACTIVE" ? (
                        <Badge color="success" className="inline-flex w-fit">
                          Activo
                        </Badge>
                      ) : (
                        <Badge color="gray" className="inline-flex w-fit">
                          {product.status ?? "-"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {codeCount > 1 ? (
                        <Badge color="info" className="inline-flex w-fit">
                          {codeCount} códigos
                        </Badge>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => setEditing(product)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => setLinking(product)}
                        >
                          Vincular
                        </Button>
                        {!product.isCanonical && (
                          <Button
                            size="xs"
                            color="gray"
                            disabled={unlink.isPending}
                            onClick={() => handleUnlink(product.barcode)}
                          >
                            Desvincular
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {showModal && <ProductFormModal onClose={() => setShowModal(false)} />}
      {editing && (
        <ProductFormModal
          product={editing}
          canonicalBarcode={canonicalBySku.get(editing.sku)}
          onClose={() => setEditing(null)}
        />
      )}
      {linking && (
        <LinkProductModal
          product={linking}
          products={products}
          onClose={() => setLinking(null)}
        />
      )}
    </div>
  );
}
