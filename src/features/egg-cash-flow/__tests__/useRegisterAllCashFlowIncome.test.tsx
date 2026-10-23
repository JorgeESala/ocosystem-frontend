import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { eggCashFlowApi } from "../api/eggCashFlow.api";
import { useRegisterAllCashFlowIncome } from "../api/eggCashFlow.queries";
import type {
  CashFlowMovement,
  TripSuggestion,
} from "../types/eggCashFlow.types";

vi.mock("../api/eggCashFlow.api", () => ({
  eggCashFlowApi: { createIncome: vi.fn() },
}));

const createIncome = vi.mocked(eggCashFlowApi.createIncome);

const trip = (overrides: Partial<TripSuggestion> = {}): TripSuggestion => ({
  tripId: 1,
  departureDate: "2026-10-05",
  driverId: 1,
  driverName: "Chofer Uno",
  routeId: 1,
  collectible: 1000,
  collected: 0,
  pending: 1000,
  ...overrides,
});

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useRegisterAllCashFlowIncome("EGG"), {
    wrapper,
  });
  return { result, invalidateSpy };
};

describe("useRegisterAllCashFlowIncome", () => {
  beforeEach(() => {
    createIncome.mockReset();
  });

  it("registers trips sequentially and classifies failures", async () => {
    createIncome
      .mockResolvedValueOnce({} as CashFlowMovement)
      .mockRejectedValueOnce(new Error("semana cerrada"));
    const { result } = setup();
    const trips = [
      trip({ tripId: 1 }),
      trip({ tripId: 2, departureDate: "2026-10-06" }),
    ];

    let outcome:
      | { registered: number; failed: { trip: TripSuggestion }[] }
      | undefined;
    await act(async () => {
      outcome = await result.current.mutateAsync(trips);
    });

    expect(outcome?.registered).toBe(1);
    expect(outcome?.failed).toHaveLength(1);
    expect(outcome?.failed[0].trip.tripId).toBe(2);
    expect(createIncome).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ tripId: 1 }),
    );
    expect(createIncome).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ tripId: 2 }),
    );
  });

  it("invalidates the feature queries once after the batch", async () => {
    createIncome.mockResolvedValue({} as CashFlowMovement);
    const { result, invalidateSpy } = setup();

    await act(async () => {
      await result.current.mutateAsync([
        trip({ tripId: 1 }),
        trip({ tripId: 2 }),
      ]);
    });

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["egg-cash-flow", "EGG"],
    });
  });
});
