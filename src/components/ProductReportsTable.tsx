import React, { useState, useMemo } from "react";

import { ProductReport } from "../services/api";

interface ProductReportsTableProps {
  reports: ProductReport[];
}

const ProductReportsTable: React.FC<ProductReportsTableProps> = ({
  reports,
}) => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<
    "name" | "quantitySold" | "totalSales" | "category"
  >("totalSales");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // 🔹 Obtener lista única de categorías
  const allCategories = useMemo(() => {
    const map = new Map<number, string>();
    reports.forEach((r) =>
      map.set(r.product.category.id, r.product.category.name),
    );
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [reports]);

  const filteredReports = useMemo(() => {
    const searchTerm = search.toLowerCase();

    const filtered = reports.filter((r) => {
      const matchesSearch = r.product.name.toLowerCase().includes(searchTerm);
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(r.product.category.id);
      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.product.name.toLowerCase();
          bValue = b.product.name.toLowerCase();
          break;
        case "category":
          aValue = a.product.category.name.toLowerCase();
          bValue = b.product.category.name.toLowerCase();
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
          break;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [reports, search, sortField, sortOrder, selectedCategories]);
  const totalQuantity = filteredReports.reduce(
    (sum, r) => sum + r.quantitySold,
    0,
  );
  const totalSales = filteredReports.reduce((sum, r) => sum + r.totalSales, 0);
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const formatNumber = function (value: number) {
    return Number.isInteger(value)
      ? value.toLocaleString("es-MX")
      : value.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  return (
    <div className="rounded-2xl bg-gray-800 p-4 text-white shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reporte de productos</h2>
        <input
          type="text"
          placeholder="Buscar producto..."
          className="w-64 rounded-lg border border-gray-300 px-3 py-2 focus:ring focus:ring-blue-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="rounded-lg border border-gray-300 bg-gray-700 px-3 py-2">
        <span className="mr-2 text-sm font-medium">
          Filtrar por categorías:
        </span>
        <div className="flex max-h-32 flex-wrap gap-2 overflow-auto">
          {allCategories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="accent-blue-600"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-600 text-left">
              <th
                className="cursor-pointer px-4 py-2"
                onClick={() => handleSort("name")}
              >
                Producto{" "}
                {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-2"
                onClick={() => handleSort("category")}
              >
                Categoría{" "}
                {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-2"
                onClick={() => handleSort("quantitySold")}
              >
                Cantidad vendida{" "}
                {sortField === "quantitySold" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-2"
                onClick={() => handleSort("totalSales")}
              >
                Total de ventas{" "}
                {sortField === "totalSales" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredReports.map((r) => (
              <tr
                key={r.product.barcode}
                className="border-b hover:bg-gray-600"
              >
                <td className="px-4 py-2">{r.product.name}</td>
                <td className="px-4 py-2">{r.product.category.name}</td>

                <td className="px-4 py-2">
                  {formatNumber(r.quantitySold)}{" "}
                  {r.product.measurement_unit.code}
                </td>

                <td className="px-4 py-2">${formatNumber(r.totalSales)}</td>
              </tr>
            ))}
            {filteredReports.length > 0 && (
              <tr className="border-b border-blue-300 bg-gray-700 font-semibold">
                <td className="px-4 py-2" colSpan={2}>
                  Totales:
                </td>
                <td className="px-4 py-2">{formatNumber(totalQuantity)}</td>
                <td className="px-4 py-2">${formatNumber(totalSales)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <p className="py-4 text-center text-gray-500">
            No se encontró ningún producto.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductReportsTable;
