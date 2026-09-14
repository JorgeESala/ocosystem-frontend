import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useSalesByBatch,
  useSalesByBatches,
  useUpdateSaleOfficeStatus,
} from "./sales.queries";
import { salesApi } from "./sales.api";

vi.mock("./sales.api", () => ({
  salesApi: {
    getByBatchId: vi.fn(async () => []),
    searchByBatchIds: vi.fn(async () => []),
    searchByBranchAndDate: vi.fn(async () => []),
    updateOfficeStatus: vi.fn(
      async (saleId: number, officeReceived: boolean) => ({
        id: saleId,
        officeReceived,
      }),
    ),
  },
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

describe("branch sales tenant scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useSalesByBatch usa una key por unidad y no comparte caché", async () => {
    const qc = newQueryClient();

    renderHook(() => useSalesByBatch(1, true), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() => expect(salesApi.getByBatchId).toHaveBeenCalledTimes(1));

    renderHook(() => useSalesByBatch(1, true), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });
    await waitFor(() => expect(salesApi.getByBatchId).toHaveBeenCalledTimes(2));

    const keys = cacheKeys(qc);
    expect(keys).toContainEqual(["batchSales", "huevo", 1]);
    expect(keys).toContainEqual(["batchSales", "pollo-vivo", 1]);
    expect(qc.getQueryCache().getAll().length).toBe(2);
  });

  it("useSalesByBatches escribe la caché por lote en la key de su unidad", async () => {
    const qc = newQueryClient();
    const sale = { id: 10, batchId: 1, officeReceived: false };
    vi.mocked(salesApi.searchByBatchIds).mockResolvedValue([sale] as never);

    renderHook(() => useSalesByBatches([1, 2]), {
      wrapper: createWrapper(qc, "huevo"),
    });

    await waitFor(() =>
      expect(qc.getQueryData(["batchSales", "huevo", 1])).toEqual([sale]),
    );

    const keys = cacheKeys(qc);
    expect(keys).toContainEqual(["batchSales", "huevo", "by-batches", [1, 2]]);
  });

  it("no consulta ventas si no hay unidad de negocio en la URL", () => {
    const qc = newQueryClient();

    renderHook(() => useSalesByBatch(1, true), {
      wrapper: noSlugWrapper(qc),
    });

    expect(salesApi.getByBatchId).not.toHaveBeenCalled();
  });

  it("useUpdateSaleOfficeStatus solo toca la caché de su unidad", async () => {
    const qc = newQueryClient();
    const staleSale = { id: 10, batchId: 1, officeReceived: false };
    qc.setQueryData(["batchSales", "huevo", 1], [{ ...staleSale }]);
    qc.setQueryData(["batchSales", "pollo-vivo", 1], [{ ...staleSale }]);

    const { result } = renderHook(() => useUpdateSaleOfficeStatus(1), {
      wrapper: createWrapper(qc, "huevo"),
    });

    await act(async () => {
      await result.current.mutateAsync({
        saleId: 10,
        officeReceived: true,
      });
    });

    expect(qc.getQueryData(["batchSales", "huevo", 1])).toEqual([
      { id: 10, batchId: 1, officeReceived: true },
    ]);
    expect(qc.getQueryData(["batchSales", "pollo-vivo", 1])).toEqual([
      staleSale,
    ]);
  });
});
