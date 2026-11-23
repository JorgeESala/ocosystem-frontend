import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { tripApi } from "../trips.api";
import { useTripSummary } from "../trips.queries";
import { tripKeys } from "../trips.keys";

const getMock = vi.hoisted(() => vi.fn());

vi.mock("@/shared/api/http", () => ({
  http: { get: getMock },
}));

const summary = {
  id: 77,
  driverId: 58,
  driverName: "Jair",
  vehicleId: null,
  vehicleName: null,
  routeId: 8,
  routeName: "J.M.M",
  departureDate: "2026-11-19",
  totalKgLoaded: null,
  totalKgReturned: null,
  batchSources: [],
  salesCount: 9,
  totalSaleAmount: 100,
  totalQuantity: 20,
  totalWeight: 30,
  totalKgSent: 31,
};

describe("trips api - resumen del viaje", () => {
  it("obtiene el resumen por id", async () => {
    getMock.mockResolvedValue({ data: summary });

    await expect(tripApi.getSummary(77)).resolves.toMatchObject({ id: 77 });
    expect(getMock).toHaveBeenCalledWith("/api/v1/trips/77");
  });

  it("consulta el resumen dentro de la clave del viaje", async () => {
    getMock.mockResolvedValue({ data: summary });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () => useTripSummary("LIVE_CHICKEN", 77),
      { wrapper },
    );

    await waitFor(() => expect(result.current.data?.id).toBe(77));
    expect(
      queryClient.getQueryData(tripKeys("LIVE_CHICKEN").summary(77)),
    ).toMatchObject({ id: 77 });
  });
});
