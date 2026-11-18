import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExpectedSalesReportDTO } from "../api/expectedSales.api";

vi.mock("@/shared/api/http", () => {
  const mockGet = vi.fn();
  return { http: { get: mockGet } };
});

import { http } from "@/shared/api/http";
import { fetchExpectedSalesReport } from "../api/expectedSales.api";

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
  },
  branches: [],
  daily: [],
} as ExpectedSalesReportDTO;

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
