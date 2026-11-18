import { describe, expect, it } from "vitest";
import {
  analyticsProductsSheet,
  categorySalesSheet,
  dailySalesSheet,
  expectedSalesBranchesSheet,
  expectedSalesRankingColumns,
  expectedSalesSheet,
  expectedSalesSummaryRows,
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
  receivedQuantity: null,
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
      receivedQuantity: 6,
    };

    const sheet = salesProductsSheet([product]);

    expect(sheet.rows[1][6]).toBe(50);
  });

  it("leaves merma without a monetary value", () => {
    const merma: ProductSalesDTO = {
      productBarcode: "IT-M",
      productName: "Pierna",
      categoryName: "Merma",
      quantitySold: 9.1,
      totalSales: null,
      unitName: "kg",
      attachmentFrequency: 0,
      categoryId: 3,
      receivedQuantity: null,
    };

    const sheet = salesProductsSheet([merma]);

    expect(sheet.rows[1][3]).toBe(9.1);
    expect(sheet.rows[1][5]).toBe("");
    expect(sheet.rows[1][6]).toBe("");
  });
});

describe("categorySalesSheet", () => {
  it("leaves merma without a monetary value", () => {
    const sheet = categorySalesSheet([
      {
        categoryId: 1,
        categoryName: "Abarrotes",
        totalSales: 300,
        quantitySold: 5,
      },
      {
        categoryId: 3,
        categoryName: "Merma",
        totalSales: null,
        quantitySold: 9.1,
      },
    ]);

    expect(sheet.rows[1][1]).toBe(300);
    expect(sheet.rows[2][1]).toBe("");
    expect(sheet.rows[2][2]).toBe(9.1);
  });
});

describe("expectedSalesSummaryRows", () => {
  it("builds the summary rows from the expected sales totals", () => {
    expect(
      expectedSalesSummaryRows({
        expectedKg: 1000,
        reportedKg: 1050,
        differenceKg: 50,
        variancePct: 5,
        birdsSold: 600,
        avgChickenWeight: 1.9,
        salesCount: 3,
        salesWithoutWeight: 0,
        salesWithoutReportedKg: 0,
        daysWithData: 1,
        wastePerChickenKg: 0.25,
      }),
    ).toEqual([
      ["Venta esperada de pollo (kg)", 1000],
      ["Kg vendidos en Entradas y Ventas", 1050],
      ["Diferencia de kilos", 50],
      ["Variación de venta esperada (%)", 5],
    ]);
  });

  it("uses blanks without a summary", () => {
    expect(expectedSalesSummaryRows(undefined)).toEqual([
      ["Venta esperada de pollo (kg)", ""],
      ["Kg vendidos en Entradas y Ventas", ""],
      ["Diferencia de kilos", ""],
      ["Variación de venta esperada (%)", ""],
    ]);
  });

  it("rounds the variance to two decimals", () => {
    const rows = expectedSalesSummaryRows({
      expectedKg: 475,
      reportedKg: 540,
      differenceKg: 65,
      variancePct: 13.6842,
      birdsSold: 300,
      avgChickenWeight: 1.8333,
      salesCount: 2,
      salesWithoutWeight: 0,
      salesWithoutReportedKg: 0,
      daysWithData: 1,
      wastePerChickenKg: 0.25,
    });

    expect(rows[3]).toEqual(["Variación de venta esperada (%)", 13.68]);
  });
});

describe("expectedSalesRankingColumns", () => {
  it("builds the expected, reported and variance columns", () => {
    expect(
      expectedSalesRankingColumns({
        expectedKg: 1000,
        expectedReportedKg: 1050,
        expectedVariancePct: 5,
      }),
    ).toEqual([1000, 1050, 5]);
  });

  it("uses blanks for missing branch values", () => {
    expect(
      expectedSalesRankingColumns({
        expectedKg: null,
        expectedReportedKg: null,
        expectedVariancePct: null,
      }),
    ).toEqual(["", "", ""]);
  });
});

describe("expectedSalesSheet", () => {
  it("includes the expected and reported kg columns", () => {
    const sheet = expectedSalesSheet([
      {
        branchId: 1,
        branchName: "Centro",
        day: "2026-06-01",
        expectedKg: 475,
        reportedKg: 540,
        differenceKg: 65,
        variancePct: 13.6842,
        birdsSold: 300,
        avgChickenWeight: 1.8333,
        salesCount: 2,
        salesWithoutWeight: 0,
        salesWithoutReportedKg: 0,
      },
    ]);

    expect(sheet.rows[0]).toEqual([
      "Fecha",
      "Sucursal",
      "Pollos vendidos",
      "Peso promedio (kg)",
      "Kg esperados",
      "Kg vendidos",
      "Diferencia (kg)",
      "Variación %",
    ]);
    expect(sheet.rows[1]).toEqual([
      "2026-06-01",
      "Centro",
      300,
      1.8333,
      475,
      540,
      65,
      13.68,
    ]);
  });

  it("leaves missing daily values blank", () => {
    const sheet = expectedSalesSheet([
      {
        branchId: 2,
        branchName: "Norte",
        day: "2026-06-02",
        expectedKg: null,
        reportedKg: null,
        differenceKg: null,
        variancePct: null,
        birdsSold: 0,
        avgChickenWeight: null,
        salesCount: 0,
        salesWithoutWeight: 1,
        salesWithoutReportedKg: 0,
      },
    ]);

    expect(sheet.rows[1]).toEqual([
      "2026-06-02",
      "Norte",
      0,
      "",
      "",
      "",
      "",
      "",
    ]);
  });
});

describe("expectedSalesBranchesSheet", () => {
  it("leaves missing expected values blank", () => {
    const sheet = expectedSalesBranchesSheet([
      {
        branchId: 2,
        branchName: "Norte",
        expectedKg: null,
        reportedKg: null,
        differenceKg: null,
        variancePct: null,
        birdsSold: 0,
        avgChickenWeight: null,
        salesCount: 0,
        salesWithoutWeight: 1,
        salesWithoutReportedKg: 0,
        daysWithData: 0,
      },
    ]);

    expect(sheet.rows[1][1]).toBe("");
    expect(sheet.rows[1][7]).toBe(1);
    expect(sheet.rows[1][8]).toBe(0);
  });

  it("keeps the variance when it is available", () => {
    const sheet = expectedSalesBranchesSheet([
      {
        branchId: 1,
        branchName: "Centro",
        expectedKg: 1000,
        reportedKg: 1050,
        differenceKg: 50,
        variancePct: 5,
        birdsSold: 600,
        avgChickenWeight: 1.9,
        salesCount: 3,
        salesWithoutWeight: 0,
        salesWithoutReportedKg: 2,
        daysWithData: 1,
      },
    ]);

    expect(sheet.rows[1][4]).toBe(5);
    expect(sheet.rows[1][8]).toBe(2);
  });
});
