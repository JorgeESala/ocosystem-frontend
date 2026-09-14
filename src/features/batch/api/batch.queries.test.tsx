import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useBatchAdjustments,
  useBatchFullDetail,
  useWeeklySalesReport,
} from "./batch.queries";
import {
  getBatchAdjustments,
  getBatchFullDetail,
  getWeeklySalesReport,
} from "./batch.api";

vi.mock("./batch.api", () => ({
  getBatches: vi.fn(async () => []),
  getBatchById: vi.fn(async () => ({})),
  getBatchSales: vi.fn(async () => []),
  getBatchAdjustments: vi.fn(async () => []),
  getBatchFullDetail: vi.fn(async () => ({})),
  getWeeklySalesReport: vi.fn(async () => []),
  getSalesByClient: vi.fn(async () => []),
  createBatchSale: vi.fn(),
  createBatch: vi.fn(),
  updateBatch: vi.fn(),
  updateBatchSale: vi.fn(),
  bulkUpdateBatchSaleRoute: vi.fn(),
}));

const createWrapper = (qc: QueryClient, slug: string) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/business/${slug}/remesas`]}>
        <Routes>
          <Route path="/business/:slug/remesas" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const noSlugWrapper = (qc: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

const newQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

const cacheKeys = (qc: QueryClient) =>
  qc
    .getQueryCache()
    .getAll()
    .map((query) => query.queryKey);

describe("batch queries tenant scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("el detalle completo usa una query key por unidad y no comparte caché", async () => {
    const qc = newQueryClient();

    renderHook(() => useBatchFullDetail(1, { enabled: true }), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() => expect(getBatchFullDetail).toHaveBeenCalledTimes(1));

    renderHook(() => useBatchFullDetail(1, { enabled: true }), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });
    await waitFor(() => expect(getBatchFullDetail).toHaveBeenCalledTimes(2));

    const keys = cacheKeys(qc);
    expect(keys).toContainEqual(["batches", "detail", "huevo", 1, "full"]);
    expect(keys).toContainEqual(["batches", "detail", "pollo-vivo", 1, "full"]);
    expect(qc.getQueryCache().getAll().length).toBe(2);
  });

  it("las bajas de remesa también se scopean por unidad", async () => {
    const qc = newQueryClient();

    renderHook(() => useBatchAdjustments(1, { enabled: true }), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() => expect(getBatchAdjustments).toHaveBeenCalledTimes(1));

    renderHook(() => useBatchAdjustments(1, { enabled: true }), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });
    await waitFor(() => expect(getBatchAdjustments).toHaveBeenCalledTimes(2));

    const keys = cacheKeys(qc);
    expect(keys).toContainEqual([
      "batches",
      "detail",
      "huevo",
      1,
      "adjustments",
    ]);
    expect(keys).toContainEqual([
      "batches",
      "detail",
      "pollo-vivo",
      1,
      "adjustments",
    ]);
  });

  it("no consulta el detalle si no hay unidad de negocio en la URL", () => {
    const qc = newQueryClient();

    renderHook(() => useBatchFullDetail(1, { enabled: true }), {
      wrapper: noSlugWrapper(qc),
    });

    expect(getBatchFullDetail).not.toHaveBeenCalled();
  });

  it("los reportes semanales se scopean por unidad", async () => {
    const qc = newQueryClient();

    renderHook(() => useWeeklySalesReport("2026-01-01", "2026-02-01"), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() => expect(getWeeklySalesReport).toHaveBeenCalledTimes(1));

    const keys = cacheKeys(qc);
    expect(keys).toContainEqual([
      "batches",
      "weekly",
      "huevo",
      "2026-01-01",
      "2026-02-01",
    ]);
  });
});
