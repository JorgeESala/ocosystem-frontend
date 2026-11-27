import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import {
  usePendingOrderBreakdown,
  usePendingOrderQuantity,
} from "../api/routeOrders.queries";
import { http } from "@/shared/api/http";

vi.mock("@/shared/api/http", () => ({
  http: { get: vi.fn() },
}));

const httpGet = vi.mocked(http.get);

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/business/pollo-vivo/pedidos"]}>
        <Routes>
          <Route path="/business/:slug/*" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("usePendingOrderQuantity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta la cantidad pendiente para el rango", async () => {
    httpGet.mockResolvedValue({
      data: { unitType: "LIVE_CHICKEN", quantity: 5, lineCount: 1 },
    });

    const { result } = renderHook(
      () => usePendingOrderQuantity("2026-01-01", "2026-01-31"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(httpGet).toHaveBeenCalledWith(
      "/api/v1/route-orders/pending-quantity",
      {
        params: { startDate: "2026-01-01", endDate: "2026-01-31" },
      },
    );
    expect(result.current.data?.quantity).toBe(5);
  });

  it("no consulta cuando falta el rango", () => {
    const { result } = renderHook(() => usePendingOrderQuantity(null, null), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(httpGet).not.toHaveBeenCalled();
  });
});

describe("usePendingOrderBreakdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta el desglose pendiente para el rango", async () => {
    httpGet.mockResolvedValue({
      data: {
        unitType: "LIVE_CHICKEN",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        totalQuantity: 50,
        lineCount: 1,
        excludedQuantity: 0,
        excludedLineCount: 0,
        days: [],
      },
    });

    const { result } = renderHook(
      () => usePendingOrderBreakdown("2026-01-01", "2026-01-31"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(httpGet).toHaveBeenCalledWith(
      "/api/v1/route-orders/pending-quantity/breakdown",
      {
        params: { startDate: "2026-01-01", endDate: "2026-01-31" },
      },
    );
    expect(result.current.data?.totalQuantity).toBe(50);
  });

  it("no consulta el desglose cuando falta el rango", () => {
    const { result } = renderHook(() => usePendingOrderBreakdown(null, null), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(httpGet).not.toHaveBeenCalled();
  });
});
