import * as XLSX from "xlsx";
import type { RoutePerformance } from "@/core/api/route/route.api";

export const ROUTE_PERFORMANCE_HEADERS = [
  "Ruta",
  "Cantidad",
  "Ventas",
  "Costo",
  "Combustible",
  "Utilidad",
  "Margen %",
  "Var. ventas %",
  "Ventas #",
];

export const buildRoutePerformanceRows = (
  rows: RoutePerformance[],
): (string | number)[][] =>
  rows.map((row) => [
    row.routeName ?? "Ventas sin ruta",
    Number(row.totalQuantity ?? 0),
    Number(row.totalSales ?? 0),
    Number(row.cogs ?? 0),
    Number(row.fuelExpense ?? 0),
    Number(row.profit ?? 0),
    row.marginPct != null ? Number(row.marginPct) : "",
    row.salesPct != null ? Number(row.salesPct) : "",
    row.saleCount,
  ]);

export const exportRoutePerformanceToExcel = (
  rows: RoutePerformance[],
  filename: string,
): void => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ROUTE_PERFORMANCE_HEADERS,
    ...buildRoutePerformanceRows(rows),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rendimiento");
  XLSX.writeFile(workbook, filename);
};
