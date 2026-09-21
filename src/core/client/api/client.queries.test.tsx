import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useClient, useClients } from "./client.queries";
import { getClient, getClients } from "./client.api";

vi.mock("./client.api", () => ({
  getClients: vi.fn(async () => []),
  getClient: vi.fn(async (id: number) => ({
    id,
    name: `Cliente ${id}`,
    isInternalBranch: false,
  })),
  createClient: vi.fn(),
  createInternalClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
  reactivateClient: vi.fn(),
  getClientPurchases: vi.fn(),
}));

const createWrapper = (qc: QueryClient, slug: string) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/business/${slug}/clients-routes`]}>
        <Routes>
          <Route
            path="/business/:slug/clients-routes"
            element={<>{children}</>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const newQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

describe("useClients tenant scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa una query key por unidad de negocio", async () => {
    const qc = newQueryClient();

    renderHook(() => useClients(), {
      wrapper: createWrapper(qc, "huevo"),
    });

    await waitFor(() => expect(getClients).toHaveBeenCalledTimes(1));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["clients", "list", "huevo", "active"]);
  });

  it("no reutiliza la caché de clientes de otra unidad", async () => {
    const qc = newQueryClient();

    renderHook(() => useClients(), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() => expect(getClients).toHaveBeenCalledTimes(1));

    renderHook(() => useClients(), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });
    await waitFor(() => expect(getClients).toHaveBeenCalledTimes(2));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["clients", "list", "huevo", "active"]);
    expect(keys).toContainEqual(["clients", "list", "pollo-vivo", "active"]);
  });

  it("separa la caché de inactivos de la de activos", async () => {
    const qc = newQueryClient();

    renderHook(() => useClients(true), {
      wrapper: createWrapper(qc, "huevo"),
    });

    await waitFor(() => expect(getClients).toHaveBeenCalledWith(true));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["clients", "list", "huevo", "all"]);
  });

  it("no consulta clientes si no hay unidad de negocio en la URL", () => {
    const qc = newQueryClient();

    renderHook(() => useClients(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>
          <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
    });

    expect(getClients).not.toHaveBeenCalled();
  });

  it("el detalle de cliente también se scopea por unidad", async () => {
    const qc = newQueryClient();

    renderHook(() => useClient(5), {
      wrapper: createWrapper(qc, "huevo"),
    });

    await waitFor(() => expect(getClient).toHaveBeenCalledWith(5));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["clients", "detail", "huevo", 5]);
  });
});
