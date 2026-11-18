import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ExpectedSalesReportDTO } from "../api/expectedSales.api";
import { fetchExpectedSalesReport } from "../api/expectedSales.api";
import { useExpectedSalesReport } from "../api/expectedSales.queries";
import { salesReportKeys } from "../api/salesReports.keys";

vi.mock("../api/expectedSales.api", () => ({
  fetchExpectedSalesReport: vi.fn(),
}));

const report = {
  summary: {
    expectedKg: null,
    reportedKg: null,
    differenceKg: null,
    variancePct: null,
    birdsSold: 0,
    avgChickenWeight: null,
    salesCount: 0,
    salesWithoutWeight: 0,
    daysWithData: 0,
    wastePerChickenKg: 0.25,
  },
  branches: [],
  daily: [],
} as ExpectedSalesReportDTO;

const wrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const newQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

describe("useExpectedSalesReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchExpectedSalesReport).mockResolvedValue(report);
  });

  it("fetches with the expected sales key", async () => {
    const queryClient = newQueryClient();
    const start = new Date(2026, 5, 1);
    const end = new Date(2026, 5, 7);

    const { result } = renderHook(
      () => useExpectedSalesReport([1, 2], start, end),
      { wrapper: wrapper(queryClient) },
    );

    await waitFor(() =>
      expect(fetchExpectedSalesReport).toHaveBeenCalledWith([1, 2], start, end),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().getAll()[0]?.queryKey).toEqual(
      salesReportKeys.expected([1, 2], start, end),
    );
  });

  it("does not fetch without branches", () => {
    const queryClient = newQueryClient();

    renderHook(
      () =>
        useExpectedSalesReport([], new Date(2026, 5, 1), new Date(2026, 5, 7)),
      { wrapper: wrapper(queryClient) },
    );

    expect(fetchExpectedSalesReport).not.toHaveBeenCalled();
  });
});
