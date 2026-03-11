import { useState, useMemo } from "react";
import {
  Table,
  TextInput,
  Checkbox,
  Label,
  Badge,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { HiSearch, HiChevronUp, HiChevronDown } from "react-icons/hi";
import type {
  CategorySalesDTO,
  ProductSalesDTO,
} from "../api/salesReports.api";

export const ProductSalesTable = ({
  products,
  categories,
}: {
  products: ProductSalesDTO[];
  categories: CategorySalesDTO[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductSalesDTO;
    direction: "asc" | "desc";
  } | null>(null);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        prod.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.productBarcode.includes(searchTerm);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes((prod as any).categoryName);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategories]);

  // Sorting logic
  const sortedProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  // Footer calculus
  const totals = useMemo(() => {
    return sortedProducts.reduce(
      (acc, curr) => ({
        qty: acc.qty + curr.quantitySold,
        sales: acc.sales + curr.totalSales,
      }),
      { qty: 0, sales: 0 },
    );
  }, [sortedProducts]);

  const requestSort = (key: keyof ProductSalesDTO) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      {/* Searcher and filters */}
      <div className="flex flex-col items-end justify-between gap-4 rounded-t-lg border-b border-gray-700 bg-gray-800 p-4 md:flex-row">
        <div className="w-full md:w-1/3">
          <Label htmlFor="search" className="mb-2 block text-gray-400">
            {" "}
            Buscar producto{" "}
          </Label>
          <TextInput
            id="search"
            icon={HiSearch}
            placeholder="Nombre o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-400">
            Filtrar por:
          </span>
          {categories.map((cat) => (
            <div key={cat.categoryId} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.categoryId}`}
                checked={selectedCategories.includes(cat.categoryName)}
                onChange={(e) => {
                  const name = cat.categoryName;
                  setSelectedCategories((prev) =>
                    e.target.checked
                      ? [...prev, name]
                      : prev.filter((c) => c !== name),
                  );
                }}
              />
              <Label
                htmlFor={`cat-${cat.categoryId}`}
                className="text-xs text-gray-300"
              >
                {cat.categoryName}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow-2xl">
        <Table hoverable className="dark">
          <TableHead>
            <TableHeadCell
              onClick={() => requestSort("productName")}
              className="cursor-pointer transition-colors hover:bg-gray-700"
            >
              Producto{" "}
              {sortConfig?.key === "productName" &&
                (sortConfig.direction === "asc" ? (
                  <HiChevronUp className="inline" />
                ) : (
                  <HiChevronDown className="inline" />
                ))}
            </TableHeadCell>
            <TableHeadCell className="text-center">Categoría</TableHeadCell>
            <TableHeadCell
              onClick={() => requestSort("quantitySold")}
              className="cursor-pointer text-center hover:bg-gray-700"
            >
              Cant. Vendida{" "}
              {sortConfig?.key === "quantitySold" &&
                (sortConfig.direction === "asc" ? (
                  <HiChevronUp className="inline" />
                ) : (
                  <HiChevronDown className="inline" />
                ))}
            </TableHeadCell>
            <TableHeadCell
              onClick={() => requestSort("totalSales")}
              className="cursor-pointer hover:bg-gray-700"
            >
              Total Ventas{" "}
              {sortConfig?.key === "totalSales" &&
                (sortConfig.direction === "asc" ? (
                  <HiChevronUp className="inline" />
                ) : (
                  <HiChevronDown className="inline" />
                ))}
            </TableHeadCell>
          </TableHead>
          <TableBody className="divide-y divide-gray-700">
            {sortedProducts.map((prod) => (
              <TableRow
                key={prod.productBarcode}
                className="border-gray-700 bg-gray-800"
              >
                <TableCell className="font-medium text-white">
                  <div className="flex flex-col">
                    <span>{prod.productName}</span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {prod.productBarcode}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {prod.categoryName === "Merma" ? (
                    // Si es tripa es merma operativa (Amarillo), si es otro es pérdida (Rojo)
                    prod.productName.toLowerCase().includes("tripa") ? (
                      <Badge color="warning" size="sm">
                        ♻️ MERMA OPERATIVA
                      </Badge>
                    ) : (
                      <Badge color="failure" size="sm">
                        ⚠️ PÉRDIDA NETA
                      </Badge>
                    )
                  ) : prod.categoryName === "Matados" ? (
                    <Badge className="border border-pink-500/50 bg-pink-900/30 text-pink-400">
                      🛠️ PRODUCCIÓN
                    </Badge>
                  ) : (
                    <Badge color="gray">{prod.categoryName}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {prod.quantitySold.toLocaleString()}{" "}
                  <span className="text-[10px] text-gray-500">
                    {prod.unitName}
                  </span>
                </TableCell>
                <TableCell className="font-bold">
                  <div className="flex flex-col items-end">
                    {/* Monto Total */}
                    <span className="text-green-400">
                      $
                      {prod.totalSales.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>

                    {/* Badge de Rendimiento (Precio Promedio) */}
                    {prod.quantitySold > 0 &&
                      prod.categoryName !== "Merma" &&
                      prod.categoryName !== "Matados" && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-medium tracking-tighter text-gray-500 uppercase">
                            Prom.
                          </span>
                          <Badge
                            color="indigo"
                            size="xs"
                            className="border border-indigo-500/30 bg-indigo-900/40 text-indigo-300"
                          >
                            ${(prod.totalSales / prod.quantitySold).toFixed(2)}{" "}
                            / {prod.unitName}
                          </Badge>
                        </div>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {/* FILA DE TOTALES */}
            <TableRow className="border-t-2 border-gray-600 bg-gray-900 font-black">
              <TableCell className="tracking-wider text-blue-400 uppercase">
                Totales Seleccionados
              </TableCell>
              <TableCell className="text-center">—</TableCell>
              <TableCell className="text-center text-lg text-white">
                {totals.qty.toLocaleString()}
              </TableCell>
              <TableCell className="text-lg text-green-400">
                $
                {totals.sales.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
