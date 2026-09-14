import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRoute, useRoutes } from "./routes.queries";
import { getRoute, getRoutes } from "./route.api";

vi.mock("./route.api", () => ({
  getRoutes: vi.fn(async () => []),
  getRoute: vi.fn(async (id: number) => ({ id, name: `Ruta ${id}` })),
  createRoute: vi.fn(),
  updateRoute: vi.fn(),
  deleteRoute: vi.fn(),
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

const newQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

describe("useRoutes tenant scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa una query key por unidad de negocio", async () => {
    const qc = newQueryClient();

    renderHook(() => useRoutes(), {
      wrapper: createWrapper(qc, "huevo"),
    });

    await waitFor(() => expect(getRoutes).toHaveBeenCalledTimes(1));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["routes", "list", "huevo"]);
  });

  it("no reutiliza la caché de rutas de otra unidad", async () => {
    const qc = newQueryClient();

    renderHook(() => useRoutes(), {
      wrapper: createWrapper(qc, "huevo"),
    });
    await waitFor(() => expect(getRoutes).toHaveBeenCalledTimes(1));

    renderHook(() => useRoutes(), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });
    await waitFor(() => expect(getRoutes).toHaveBeenCalledTimes(2));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["routes", "list", "huevo"]);
    expect(keys).toContainEqual(["routes", "list", "pollo-vivo"]);
  });

  it("no consulta rutas si no hay unidad de negocio en la URL", () => {
    const qc = newQueryClient();

    renderHook(() => useRoutes(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>
          <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
    });

    expect(getRoutes).not.toHaveBeenCalled();
  });

  it("el detalle de ruta también se scopea por unidad", async () => {
    const qc = newQueryClient();

    renderHook(() => useRoute(5), {
      wrapper: createWrapper(qc, "huevo"),
    });

    await waitFor(() => expect(getRoute).toHaveBeenCalledWith(5));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["routes", "detail", "huevo", 5]);
  });
});
