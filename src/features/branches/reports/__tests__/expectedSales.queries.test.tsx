import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  ExpectedSalesReportDTO,
  ReferenceProductDTO,
} from "../api/expectedSales.api";
import {
  deleteReferenceProduct,
  fetchExpectedSalesReport,
  fetchReferenceProducts,
  updateReferenceProduct,
} from "../api/expectedSales.api";
import {
  useDeleteReferenceProduct,
  useExpectedSalesReport,
  useReferenceProducts,
  useUpdateReferenceProduct,
} from "../api/expectedSales.queries";
import { salesReportKeys } from "../api/salesReports.keys";

vi.mock("../api/expectedSales.api", () => ({
  fetchExpectedSalesReport: vi.fn(),
  fetchReferenceProducts: vi.fn(),
  updateReferenceProduct: vi.fn(),
  deleteReferenceProduct: vi.fn(),
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
    salesWithoutReportedKg: 0,
    daysWithData: 0,
    wastePerChickenKg: 0.25,
    expectedMoney: null,
    reportedMoney: null,
    moneyDifference: null,
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

describe("reference product queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchReferenceProducts).mockResolvedValue([referenceProduct]);
    vi.mocked(updateReferenceProduct).mockResolvedValue(referenceProduct);
    vi.mocked(deleteReferenceProduct).mockResolvedValue(undefined);
  });

  it("fetches reference products with the as-of key", async () => {
    const queryClient = newQueryClient();

    const { result } = renderHook(() => useReferenceProducts("2026-06-07"), {
      wrapper: wrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchReferenceProducts).toHaveBeenCalledWith("2026-06-07");
    expect(queryClient.getQueryCache().getAll()[0]?.queryKey).toEqual(
      salesReportKeys.referenceProducts("2026-06-07"),
    );
  });

  it("updates a reference product and invalidates the reports", async () => {
    const queryClient = newQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateReferenceProduct(), {
      wrapper: wrapper(queryClient),
    });

    await result.current.mutateAsync({ branchId: 1, productBarcode: "REF" });

    expect(updateReferenceProduct).toHaveBeenCalledWith(1, "REF");
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: salesReportKeys.all,
    });
  });

  it("clears a reference product and invalidates the reports", async () => {
    const queryClient = newQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteReferenceProduct(), {
      wrapper: wrapper(queryClient),
    });

    await result.current.mutateAsync(1);

    expect(deleteReferenceProduct).toHaveBeenCalledWith(1);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: salesReportKeys.all,
    });
  });
});
