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
        expectedMoney: 5000,
        reportedMoney: 6000,
        comparableReportedMoney: 5500,
        moneyDifference: 500,
        effectivePricePerKg: 50,
        daysWithoutPrice: 0,
        comparableDays: 1,
        branchesWithoutReference: 0,
        salesWithZeroMoney: 0,
      }),
    ).toEqual([
      ["Venta esperada de pollo (kg)", 1000],
      ["Kg vendidos en Entradas y Ventas", 1050],
      ["Diferencia de kilos", 50],
      ["Variación de venta esperada (%)", 5],
      ["Venta mínima esperada (dinero)", 5000],
      ["Venta registrada total (dinero)", 6000],
      ["Venta registrada comparable (dinero)", 5500],
      ["Diferencia contra el mínimo", 500],
      ["Precio efectivo del periodo", 50],
      ["Días comparables", 1],
      ["Días sin precio de referencia", 0],
      ["Sucursales sin producto de referencia", 0],
      ["Ventas con monto cero", 0],
    ]);
  });

  it("uses blanks without a summary", () => {
    expect(expectedSalesSummaryRows(undefined)).toEqual([
      ["Venta esperada de pollo (kg)", ""],
      ["Kg vendidos en Entradas y Ventas", ""],
      ["Diferencia de kilos", ""],
      ["Variación de venta esperada (%)", ""],
      ["Venta mínima esperada (dinero)", ""],
      ["Venta registrada total (dinero)", ""],
      ["Venta registrada comparable (dinero)", ""],
      ["Diferencia contra el mínimo", ""],
      ["Precio efectivo del periodo", ""],
      ["Días comparables", ""],
      ["Días sin precio de referencia", ""],
      ["Sucursales sin producto de referencia", ""],
      ["Ventas con monto cero", ""],
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
      expectedMoney: null,
      reportedMoney: null,
      comparableReportedMoney: null,
      moneyDifference: null,
      effectivePricePerKg: null,
      daysWithoutPrice: 0,
      comparableDays: 0,
      branchesWithoutReference: 0,
      salesWithZeroMoney: 0,
    });

    expect(rows[3]).toEqual(["Variación de venta esperada (%)", 13.68]);
  });
});

describe("expectedSalesRankingColumns", () => {
  it("builds the expected, reported, variance and money columns", () => {
    expect(
      expectedSalesRankingColumns({
        expectedKg: 1000,
        expectedReportedKg: 1050,
        expectedVariancePct: 5,
        expectedMoney: 5000,
        reportedMoney: 6000,
        comparableReportedMoney: 5500,
        moneyDifference: 500,
        comparableDays: 2,
        effectivePricePerKg: 50,
      }),
    ).toEqual([1000, 1050, 5, 5000, 6000, 5500, 500, 2, 50]);
  });

  it("uses blanks for missing branch values", () => {
    expect(
      expectedSalesRankingColumns({
        expectedKg: null,
        expectedReportedKg: null,
        expectedVariancePct: null,
        expectedMoney: null,
        reportedMoney: null,
        comparableReportedMoney: null,
        moneyDifference: null,
        comparableDays: 0,
        effectivePricePerKg: null,
      }),
    ).toEqual(["", "", "", "", "", "", "", 0, ""]);
  });
});

describe("expectedSalesSheet", () => {
  it("includes the kg, price and money columns", () => {
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
        referencePricePerKg: 50,
        priceAsOf: "2026-06-01",
        expectedMoney: 23750,
        reportedMoney: 24000,
        comparableReportedMoney: 24000,
        moneyDifference: 250,
        salesWithZeroMoney: 0,
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
      "Precio referencia/kg",
      "Precio al",
      "Mínimo esperado ($)",
      "Venta total ($)",
      "Venta comparable ($)",
      "Diferencia contra mínimo ($)",
      "Ventas con monto cero",
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
      50,
      "2026-06-01",
      23750,
      24000,
      24000,
      250,
      0,
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
        referencePricePerKg: null,
        priceAsOf: null,
        expectedMoney: null,
        reportedMoney: null,
        comparableReportedMoney: null,
        moneyDifference: null,
        salesWithZeroMoney: 0,
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
      "",
      "",
      "",
      "",
      "",
      "",
      0,
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
        referenceProductBarcode: null,
        referenceProductName: null,
        referencePricePerKg: null,
        priceAsOf: null,
        expectedMoney: null,
        reportedMoney: null,
        comparableReportedMoney: null,
        moneyDifference: null,
        effectivePricePerKg: null,
        priceMissingDays: 0,
        comparableDays: 0,
        salesWithZeroMoney: 0,
      },
    ]);

    expect(sheet.rows[1][1]).toBe("");
    expect(sheet.rows[1][11]).toBe(1);
    expect(sheet.rows[1][12]).toBe(0);
    expect(sheet.rows[1][13]).toBe("");
    expect(sheet.rows[1][18]).toBe(0);
    expect(sheet.rows[1][19]).toBe(0);
  });

  it("keeps the variance and money when they are available", () => {
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
        referenceProductBarcode: "REF",
        referenceProductName: "Pollo entero",
        referencePricePerKg: 50,
        priceAsOf: "2026-06-01",
        expectedMoney: 50000,
        reportedMoney: 51000,
        comparableReportedMoney: 51000,
        moneyDifference: 1000,
        effectivePricePerKg: 50,
        priceMissingDays: 0,
        comparableDays: 1,
        salesWithZeroMoney: 0,
      },
    ]);

    expect(sheet.rows[1][1]).toBe("Pollo entero");
    expect(sheet.rows[1][2]).toBe(50);
    expect(sheet.rows[1][4]).toBe(50);
    expect(sheet.rows[1][8]).toBe(5);
    expect(sheet.rows[1][12]).toBe(2);
    expect(sheet.rows[1][13]).toBe(50000);
    expect(sheet.rows[1][14]).toBe(51000);
    expect(sheet.rows[1][15]).toBe(51000);
    expect(sheet.rows[1][16]).toBe(1000);
    expect(sheet.rows[1][17]).toBe(1);
    expect(sheet.rows[1][19]).toBe(0);
  });
});
