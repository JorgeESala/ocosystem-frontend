import { describe, expect, it } from "vitest";
import {
  analyticsProductsSheet,
  dailySalesSheet,
  salesProductsSheet,
} from "../utils/reportExcel";
import type { ProductAnalyticsRowDTO } from "../api/productAnalytics.api";
import type { ProductSalesDTO } from "../api/salesReports.api";

const analyticsRow = (
  overrides: Partial<ProductAnalyticsRowDTO> = {},
): ProductAnalyticsRowDTO => ({
  productBarcode: "IT-A",
  productName: "Producto A",
  categoryName: "Abarrotes",
  unitName: "kg",
  quantity: 10,
  sales: 500,
  daysWithSales: 4,
  avgDailyQuantity: 2.5,
  previousQuantity: 0,
  previousSales: 0,
  salesGrowth: null,
  cancelledQuantity: 0,
  cancelledSubtotal: 0,
  branchBreakdown: [],
  abcClass: "A",
  ...overrides,
});

describe("dailySalesSheet", () => {
  it("adds the weekday column", () => {
    const sheet = dailySalesSheet([
      { day: "2026-06-08", totalSales: 100, totalTickets: 2, realTickets: 2 },
    ]);

    expect(sheet.rows[0]).toEqual([
      "Fecha",
      "Día",
      "Venta real",
      "Tickets totales",
      "Tickets reales",
    ]);
    expect(sheet.rows[1]).toEqual(["2026-06-08", "lunes", 100, 2, 2]);
  });
});

describe("analyticsProductsSheet", () => {
  it("includes class, growth and cancellations", () => {
    const sheet = analyticsProductsSheet("Catálogo", [
      analyticsRow(),
      analyticsRow({
        productBarcode: "IT-B",
        salesGrowth: 12.346,
        cancelledSubtotal: -50,
      }),
    ]);

    expect(sheet.rows[0]).toContain("Clase");
    expect(sheet.rows[0]).toContain("Cancelaciones");
    expect(sheet.rows[1][3]).toBe("A");
    expect(sheet.rows[1][9]).toBe("");
    expect(sheet.rows[2][9]).toBe(12.35);
    expect(sheet.rows[2][10]).toBe(-50);
  });
});

describe("salesProductsSheet", () => {
  it("computes the average price", () => {
    const product: ProductSalesDTO = {
      productBarcode: "IT-A",
      productName: "Producto A",
      categoryName: "Abarrotes",
      quantitySold: 4,
      totalSales: 200,
      unitName: "kg",
      attachmentFrequency: 1,
      categoryId: 4,
    };

    const sheet = salesProductsSheet([product]);

    expect(sheet.rows[1][6]).toBe(50);
  });
});
