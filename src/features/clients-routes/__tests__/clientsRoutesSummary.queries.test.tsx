import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useClientRoutesSummary,
  useRouteCalendar,
} from "../api/summary.queries";
import { getRouteCalendar, getSummary } from "../api/summary.api";

vi.mock("../api/summary.api", () => ({
  getSummary: vi.fn(async () => ({})),
  getRouteCalendar: vi.fn(async () => []),
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

describe("clients routes summary hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta el resumen con fechas, días de dormido y comparación scoped por negocio", async () => {
    const qc = newQueryClient();

    renderHook(
      () =>
        useClientRoutesSummary(
          "2030-01-01",
          "2030-01-31",
          60,
          "PREVIOUS_MONTH",
        ),
      {
        wrapper: createWrapper(qc, "huevo"),
      },
    );

    await waitFor(() =>
      expect(getSummary).toHaveBeenCalledWith(
        "2030-01-01",
        "2030-01-31",
        60,
        "PREVIOUS_MONTH",
      ),
    );

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual([
      "clientsRoutesSummary",
      "summary",
      "huevo",
      "2030-01-01",
      "2030-01-31",
      60,
      "PREVIOUS_MONTH",
    ]);
  });

  it("no consulta sin rango completo", () => {
    const qc = newQueryClient();

    renderHook(() => useClientRoutesSummary(null, null, 30, "WINDOW"), {
      wrapper: createWrapper(qc, "huevo"),
    });

    expect(getSummary).not.toHaveBeenCalled();
  });

  it("consulta el calendario de rutas scoped por negocio", async () => {
    const qc = newQueryClient();

    renderHook(() => useRouteCalendar(), {
      wrapper: createWrapper(qc, "pollo-vivo"),
    });

    await waitFor(() => expect(getRouteCalendar).toHaveBeenCalledTimes(1));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual([
      "clientsRoutesSummary",
      "calendar",
      "pollo-vivo",
    ]);
  });
});
