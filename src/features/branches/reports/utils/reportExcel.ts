import * as XLSX from "xlsx";
import { getDayName } from "@/utils/date.utils";
import type {
  CategorySalesDTO,
  DailySalesDTO,
  ProductSalesDTO,
} from "../api/salesReports.api";
import type {
  BranchExpectedSalesDTO,
  DailyExpectedSalesDTO,
  ExpectedSalesSummaryDTO,
} from "../api/expectedSales.api";
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
      hasMonetaryValue(category.categoryName, category.totalSales)
        ? category.totalSales
        : "",
      category.quantitySold,
    ]),
  ],
  cols: [{ wch: 22 }, { wch: 14 }, { wch: 12 }],
});

const hasMonetaryValue = (
  categoryName: string,
  totalSales: number | null,
): totalSales is number => categoryName !== "Merma" && totalSales != null;

export const expectedSalesSummaryRows = (
  summary: ExpectedSalesSummaryDTO | null | undefined,
): (string | number)[][] => [
  ["Venta esperada de pollo (kg)", summary?.expectedKg ?? ""],
  ["Kg vendidos en Entradas y Ventas", summary?.reportedKg ?? ""],
  ["Diferencia de kilos", summary?.differenceKg ?? ""],
  [
    "Variación de venta esperada (%)",
    summary?.variancePct == null ? "" : Number(summary.variancePct.toFixed(2)),
  ],
  ["Venta mínima esperada (dinero)", summary?.expectedMoney ?? ""],
  ["Venta registrada total (dinero)", summary?.reportedMoney ?? ""],
  [
    "Venta registrada comparable (dinero)",
    summary?.comparableReportedMoney ?? "",
  ],
  ["Diferencia contra el mínimo", summary?.moneyDifference ?? ""],
  ["Precio efectivo del periodo", summary?.effectivePricePerKg ?? ""],
  ["Días comparables", summary?.comparableDays ?? ""],
  ["Días sin precio de referencia", summary?.daysWithoutPrice ?? ""],
  [
    "Sucursales sin producto de referencia",
    summary?.branchesWithoutReference ?? "",
  ],
  ["Ventas con monto cero", summary?.salesWithZeroMoney ?? ""],
  ["Ventas sin monto registrado", summary?.salesWithoutReportedMoney ?? ""],
  ["Días sin monto registrado", summary?.daysWithoutReportedMoney ?? ""],
];

export const expectedSalesRankingColumns = (branch: {
  expectedKg: number | null;
  expectedReportedKg: number | null;
  expectedVariancePct: number | null;
  expectedMoney: number | null;
  reportedMoney: number | null;
  comparableReportedMoney: number | null;
  moneyDifference: number | null;
  comparableDays: number;
  effectivePricePerKg: number | null;
  salesWithoutReportedMoney: number;
}): (string | number)[] => [
  branch.expectedKg ?? "",
  branch.expectedReportedKg ?? "",
  branch.expectedVariancePct == null
    ? ""
    : Number(branch.expectedVariancePct.toFixed(2)),
  branch.expectedMoney ?? "",
  branch.reportedMoney ?? "",
  branch.comparableReportedMoney ?? "",
  branch.moneyDifference ?? "",
  branch.comparableDays,
  branch.effectivePricePerKg ?? "",
  branch.salesWithoutReportedMoney,
];

export const expectedSalesSheet = (
  daily: DailyExpectedSalesDTO[],
): SheetSpec => ({
  name: "Venta esperada",
  rows: [
    [
      "Fecha",
      "Sucursal",
      "Pollos vendidos",
      "Peso promedio (kg)",
      "Kg esperados",
      "Kg vendidos",
      "Diferencia (kg)",
      "Variación %",
      "Precio referencia/kg",
      "Precio al",
      "Mínimo esperado ($)",
      "Venta total ($)",
      "Venta comparable ($)",
      "Diferencia contra mínimo ($)",
      "Ventas con monto cero",
      "Ventas sin monto registrado",
    ],
    ...daily.map((row) => [
      row.day,
      row.branchName,
      row.birdsSold,
      row.avgChickenWeight ?? "",
      row.expectedKg ?? "",
      row.reportedKg ?? "",
      row.differenceKg ?? "",
      row.variancePct == null ? "" : Number(row.variancePct.toFixed(2)),
      row.referencePricePerKg ?? "",
      row.priceAsOf ?? "",
      row.expectedMoney ?? "",
      row.reportedMoney ?? "",
      row.comparableReportedMoney ?? "",
      row.moneyDifference ?? "",
      row.salesWithZeroMoney,
      row.salesWithoutReportedMoney,
    ]),
  ],
  cols: [
    { wch: 12 },
    { wch: 22 },
    { wch: 15 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 15 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 22 },
  ],
});

export const expectedSalesBranchesSheet = (
  branches: BranchExpectedSalesDTO[],
): SheetSpec => ({
  name: "Venta esperada por sucursal",
  rows: [
    [
      "Sucursal",
      "Producto de referencia",
      "Precio al cierre/kg",
      "Precio al",
      "Precio efectivo/kg",
      "Kg esperados",
      "Kg vendidos",
      "Diferencia (kg)",
      "Variación %",
      "Pollos vendidos",
      "Peso promedio (kg)",
      "Ventas sin peso",
      "Ventas sin kilos",
      "Mínimo esperado ($)",
      "Venta total ($)",
      "Venta comparable ($)",
      "Diferencia ($)",
      "Días comparables",
      "Días sin precio",
      "Ventas con monto cero",
      "Ventas sin monto registrado",
      "Días sin monto registrado",
    ],
    ...branches.map((branch) => [
      branch.branchName,
      branch.referenceProductName ?? "",
      branch.referencePricePerKg ?? "",
      branch.priceAsOf ?? "",
      branch.effectivePricePerKg ?? "",
      branch.expectedKg ?? "",
      branch.reportedKg ?? "",
      branch.differenceKg ?? "",
      branch.variancePct == null ? "" : Number(branch.variancePct.toFixed(2)),
      branch.birdsSold,
      branch.avgChickenWeight ?? "",
      branch.salesWithoutWeight,
      branch.salesWithoutReportedKg,
      branch.expectedMoney ?? "",
      branch.reportedMoney ?? "",
      branch.comparableReportedMoney ?? "",
      branch.moneyDifference ?? "",
      branch.comparableDays,
      branch.priceMissingDays,
      branch.salesWithZeroMoney,
      branch.salesWithoutReportedMoney,
      branch.daysWithoutReportedMoney,
    ]),
  ],
  cols: [
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 15 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
  ],
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
      hasMonetaryValue(product.categoryName, product.totalSales)
        ? product.totalSales
        : "",
      hasMonetaryValue(product.categoryName, product.totalSales) &&
      product.quantitySold > 0
        ? Number((product.totalSales / product.quantitySold).toFixed(2))
        : "",
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
