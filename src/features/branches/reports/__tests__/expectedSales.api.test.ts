import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ExpectedSalesReportDTO,
  ReferenceProductDTO,
} from "../api/expectedSales.api";

vi.mock("@/shared/api/http", () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  return { http: { get: mockGet, put: mockPut, delete: mockDelete } };
});

import { http } from "@/shared/api/http";
import {
  deleteReferenceProduct,
  fetchExpectedSalesReport,
  fetchReferenceProducts,
  updateReferenceProduct,
} from "../api/expectedSales.api";

const mockedHttp = vi.mocked(http);

const report = {
  summary: {
    expectedKg: 100,
    reportedKg: 110,
    differenceKg: 10,
    variancePct: 10,
    birdsSold: 60,
    avgChickenWeight: 1.8,
    salesCount: 1,
    salesWithoutWeight: 0,
    salesWithoutReportedKg: 0,
    daysWithData: 1,
    wastePerChickenKg: 0.25,
    expectedMoney: 5000,
    reportedMoney: 5500,
    moneyDifference: 500,
    daysWithoutPrice: 0,
    branchesWithoutReference: 0,
  },
  branches: [],
  daily: [],
} as ExpectedSalesReportDTO;

const referenceProduct: ReferenceProductDTO = {
  branchId: 1,
  branchName: "Centro",
  productBarcode: "REF",
  productName: "Pollo entero",
  unitName: "Kilogramo",
  pricePerKg: 50,
  priceAsOf: "2026-06-07",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchExpectedSalesReport", () => {
  it("sends every branch and the date range to the expected sales endpoint", async () => {
    mockedHttp.get.mockResolvedValue({ data: report });

    const start = new Date(2026, 5, 1);
    const end = new Date(2026, 5, 7);
    const result = await fetchExpectedSalesReport([1, 2], start, end);

    expect(mockedHttp.get).toHaveBeenCalledTimes(1);
    const url = mockedHttp.get.mock.calls[0][0] as string;
    expect(url).toContain("/api/reports/sales/expected?");
    expect(url).toContain("branchIds=1");
    expect(url).toContain("branchIds=2");
    expect(url).toContain("startDate=");
    expect(url).toContain("endDate=");
    expect(result).toBe(report);
  });
});

describe("reference product requests", () => {
  it("fetches the reference products as of the report end", async () => {
    mockedHttp.get.mockResolvedValue({ data: [referenceProduct] });

    const result = await fetchReferenceProducts("2026-06-07");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/reports/sales/expected/reference-products?asOf=2026-06-07",
    );
    expect(result).toEqual([referenceProduct]);
  });

  it("updates the reference product of a branch", async () => {
    mockedHttp.put.mockResolvedValue({ data: referenceProduct });

    const result = await updateReferenceProduct(1, "REF");

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/api/reports/sales/expected/reference-products/1",
      { productBarcode: "REF" },
    );
    expect(result).toEqual(referenceProduct);
  });

  it("clears the reference product of a branch", async () => {
    mockedHttp.delete.mockResolvedValue({});

    await deleteReferenceProduct(1);

    expect(mockedHttp.delete).toHaveBeenCalledWith(
      "/api/reports/sales/expected/reference-products/1",
    );
  });
});
