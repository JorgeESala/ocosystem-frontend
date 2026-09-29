import * as XLSX from "xlsx";
import { getDayName } from "@/utils/date.utils";
import type {
  CategorySalesDTO,
  DailySalesDTO,
  ProductSalesDTO,
} from "../api/salesReports.api";
import type {
  ProductAnalyticsDTO,
  ProductAnalyticsRowDTO,
} from "../api/productAnalytics.api";

export interface SheetSpec {
  name: string;
  rows: (string | number)[][];
  cols: { wch: number }[];
}

export const appendSheet = (workbook: XLSX.WorkBook, spec: SheetSpec) => {
  const sheet = XLSX.utils.aoa_to_sheet(spec.rows);
  sheet["!cols"] = spec.cols;
  XLSX.utils.book_append_sheet(workbook, sheet, spec.name);
};

export const dailySalesSheet = (dailySales: DailySalesDTO[]): SheetSpec => ({
  name: "Ventas Diarias",
  rows: [
    ["Fecha", "Día", "Venta real", "Tickets totales", "Tickets reales"],
    ...dailySales.map((day) => [
      day.day,
      getDayName(day.day),
      day.totalSales,
      day.totalTickets,
      day.realTickets,
    ]),
  ],
  cols: [{ wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }],
});

export const categorySalesSheet = (
  categories: CategorySalesDTO[],
): SheetSpec => ({
  name: "Categorías",
  rows: [
    ["Categoría", "Venta real", "Cantidad"],
    ...categories.map((category) => [
      category.categoryName,
      category.totalSales,
      category.quantitySold,
    ]),
  ],
  cols: [{ wch: 22 }, { wch: 14 }, { wch: 12 }],
});

export const analyticsProductsSheet = (
  name: string,
  products: ProductAnalyticsRowDTO[],
): SheetSpec => ({
  name,
  rows: [
    [
      "Código",
      "Producto",
      "Categoría",
      "Clase",
      "Cantidad",
      "Unidad",
      "Venta real",
      "Días con venta",
      "Prom./día",
      "vs. anterior %",
      "Cancelaciones",
    ],
    ...products.map((product) => [
      product.productBarcode,
      product.productName,
      product.categoryName,
      product.abcClass,
      product.quantity,
      product.unitName,
      product.sales,
      product.daysWithSales,
      product.avgDailyQuantity,
      product.salesGrowth == null ? "" : Number(product.salesGrowth.toFixed(2)),
      product.cancelledSubtotal,
    ]),
  ],
  cols: [
    { wch: 16 },
    { wch: 28 },
    { wch: 16 },
    { wch: 8 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 14 },
  ],
});

export const salesProductsSheet = (products: ProductSalesDTO[]): SheetSpec => ({
  name: "Productos",
  rows: [
    [
      "Código",
      "Producto",
      "Categoría",
      "Cantidad",
      "Unidad",
      "Venta real",
      "Precio promedio",
    ],
    ...products.map((product) => [
      product.productBarcode,
      product.productName,
      product.categoryName,
      product.quantitySold,
      product.unitName,
      product.totalSales,
      product.quantitySold > 0
        ? Number((product.totalSales / product.quantitySold).toFixed(2))
        : 0,
    ]),
  ],
  cols: [
    { wch: 16 },
    { wch: 28 },
    { wch: 16 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
  ],
});

export const fetchAllProductAnalytics = async (
  fetchPage: (offset: number, limit: number) => Promise<ProductAnalyticsDTO>,
  pageSize = 50,
): Promise<ProductAnalyticsRowDTO[]> => {
  const products: ProductAnalyticsRowDTO[] = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const page = await fetchPage(offset, pageSize);
    total = page.total;
    products.push(...page.products);
    if (page.products.length === 0) break;
    offset += pageSize;
  }

  return products;
};
