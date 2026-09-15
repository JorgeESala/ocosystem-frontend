import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useInboundBatches,
  useLatestInboundBatches,
} from "./inboundBatches.queries";
import { useInboundBatchSales } from "./inboundBatchSales.queries";
import {
  getInboundBatches,
  getLatestInboundBatches,
} from "./inboundBatches.api";
import { getInboundBatchSales } from "./inboundBatchSales.api";

vi.mock("./inboundBatches.api", () => ({
  getInboundBatches: vi.fn(async () => []),
  getLatestInboundBatches: vi.fn(async () => []),
  getInboundBatchesByDateRange: vi.fn(async () => []),
  createInboundBatch: vi.fn(),
  updateInboundBatch: vi.fn(),
  deleteInboundBatch: vi.fn(),
}));

vi.mock("./inboundBatchSales.api", () => ({
  getInboundBatchSales: vi.fn(async () => []),
  createInboundBatchSale: vi.fn(),
  updateInboundBatchSale: vi.fn(),
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

describe("live chicken inbound batch caches tenant scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useInboundBatches usa una key por unidad y no comparte caché", async () => {
    const qc = newQueryClient();

    renderHook(() => useInboundBatches(), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });
    await waitFor(() => expect(getInboundBatches).toHaveBeenCalledTimes(1));

    renderHook(() => useInboundBatches(), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() => expect(getInboundBatches).toHaveBeenCalledTimes(2));

    const keys = cacheKeys(qc);
    expect(keys).toContainEqual([
      "live-chicken",
      "inbound-batches",
      "list",
      "pollo-vivo",
      { filters: undefined },
    ]);
    expect(keys).toContainEqual([
      "live-chicken",
      "inbound-batches",
      "list",
      "huevo",
      { filters: undefined },
    ]);
  });

  it("useLatestInboundBatches scopea la key y no reutiliza la otra unidad", async () => {
    const qc = newQueryClient();

    renderHook(() => useLatestInboundBatches(15), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });
    await waitFor(() =>
      expect(getLatestInboundBatches).toHaveBeenCalledTimes(1),
    );

    renderHook(() => useLatestInboundBatches(15), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() =>
      expect(getLatestInboundBatches).toHaveBeenCalledTimes(2),
    );

    const keys = cacheKeys(qc);
    expect(keys).toContainEqual([
      "live-chicken",
      "inbound-batches",
      "latest",
      "pollo-vivo",
      15,
    ]);
    expect(keys).toContainEqual([
      "live-chicken",
      "inbound-batches",
      "latest",
      "huevo",
      15,
    ]);
  });

  it("useInboundBatchSales scopea la key por unidad", async () => {
    const qc = newQueryClient();

    renderHook(() => useInboundBatchSales(1), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });
    await waitFor(() => expect(getInboundBatchSales).toHaveBeenCalledTimes(1));

    renderHook(() => useInboundBatchSales(1), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() => expect(getInboundBatchSales).toHaveBeenCalledTimes(2));

    const keys = cacheKeys(qc);
    expect(keys).toContainEqual(["inboundBatchSales", "list", "pollo-vivo", 1]);
    expect(keys).toContainEqual(["inboundBatchSales", "list", "huevo", 1]);
  });

  it("no consulta si no hay unidad de negocio en la URL", () => {
    const qc = newQueryClient();

    renderHook(() => useInboundBatches(), {
      wrapper: noSlugWrapper(qc),
    });
    renderHook(() => useInboundBatchSales(1), {
      wrapper: noSlugWrapper(qc),
    });

    expect(getInboundBatches).not.toHaveBeenCalled();
    expect(getInboundBatchSales).not.toHaveBeenCalled();
  });
});
