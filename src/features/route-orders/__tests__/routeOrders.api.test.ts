import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMock = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/shared/api/http", () => ({
  http: httpMock,
}));

import {
  getPendingOrderBreakdown,
  getPendingOrderQuantity,
} from "../api/routeOrders.api";

describe("routeOrders api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta los pedidos pendientes por rango", async () => {
    httpMock.get.mockResolvedValue({
      data: { unitType: "LIVE_CHICKEN", quantity: 5, lineCount: 1 },
    });

    const result = await getPendingOrderQuantity("2026-01-01", "2026-01-31");

    expect(httpMock.get).toHaveBeenCalledWith(
      "/api/v1/route-orders/pending-quantity",
      {
        params: { startDate: "2026-01-01", endDate: "2026-01-31" },
      },
    );
    expect(result.quantity).toBe(5);
  });

  it("consulta el desglose de pedidos pendientes por rango", async () => {
    httpMock.get.mockResolvedValue({
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

    const result = await getPendingOrderBreakdown("2026-01-01", "2026-01-31");

    expect(httpMock.get).toHaveBeenCalledWith(
      "/api/v1/route-orders/pending-quantity/breakdown",
      {
        params: { startDate: "2026-01-01", endDate: "2026-01-31" },
      },
    );
    expect(result.totalQuantity).toBe(50);
  });
});
