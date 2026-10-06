import { Badge, Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { useState } from "react";
import { useProductCatalog } from "../api/product-catalog.queries";
import NewProductModal from "../components/NewProductModal";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { data: products = [], isLoading, isError } = useProductCatalog();

  const matches =
    query.trim() === ""
      ? products
      : products.filter(
          (product) =>
            product.barcode.toLowerCase().includes(query.trim().toLowerCase()) ||
            product.name.toLowerCase().includes(query.trim().toLowerCase()),
        );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Productos</h1>
          <p className="text-sm text-slate-400">
            Catálogo de piezas. Crea productos por anticipado para que las
            sucursales los registren al recibir.
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

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-400">No se pudo cargar el catálogo.</p>
      ) : matches.length === 0 ? (
        <p className="text-sm text-slate-400">Sin coincidencias en el catálogo.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>Código</TableHeadCell>
              <TableHeadCell>Nombre</TableHeadCell>
              <TableHeadCell>Categoría</TableHeadCell>
              <TableHeadCell>Unidad</TableHeadCell>
              <TableHeadCell>Estado</TableHeadCell>
            </TableHead>
            <TableBody>
              {matches.map((product) => (
                <TableRow key={product.barcode}>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.categoryName ?? "-"}</TableCell>
                  <TableCell>{product.unitName ?? "-"}</TableCell>
                  <TableCell>
                    {product.status === "ACTIVE" ? (
                      <Badge color="success">Activo</Badge>
                    ) : (
                      <Badge color="gray">{product.status ?? "-"}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showModal && <NewProductModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
