import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useUnitCashAccount,
  useUnitCashAdjustments,
  useUnitCashAlerts,
  useUnitCashCuts,
  useUnitCashFlow,
  useUnitCashReconciliationPreview,
} from "../api/unitCash.queries";
import { unitCashApi } from "../api/unitCash.api";

vi.mock("../api/unitCash.api", () => ({
  unitCashApi: {
    getAccount: vi.fn(async () => null),
    getCuts: vi.fn(async () => []),
    getFlow: vi.fn(async () => ({
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      frequency: "daily",
      points: [],
      summary: {
        totalIngresos: 0,
        totalGastos: 0,
        totalNeto: 0,
        currentBalance: 0,
      },
    })),
    getAlerts: vi.fn(async () => []),
    getAdjustments: vi.fn(async () => []),
    getReconciliationPreview: vi.fn(async () => ({
      from: "2026-09-01",
      to: "2026-09-30",
      changes: [],
      created: 0,
      updated: 0,
      deleted: 0,
      previousBalance: null,
      projectedBalance: null,
      lastReconciledAt: null,
    })),
    applyReconciliation: vi.fn(async () => ({})),
  },
}));

const createWrapper = (qc: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

const newQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

const start = new Date("2026-09-01T00:00:00");
const end = new Date("2026-09-30T00:00:00");

describe("unit cash query keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scopes the account key by unit", async () => {
    const qc = newQueryClient();

    renderHook(() => useUnitCashAccount("EGG"), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() =>
      expect(unitCashApi.getAccount).toHaveBeenCalledTimes(1),
    );

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["unit-general-cash", "EGG", "account"]);
  });

  it("does not reuse the cache across units", async () => {
    const qc = newQueryClient();

    renderHook(() => useUnitCashAccount("EGG"), {
      wrapper: createWrapper(qc),
    });
    await waitFor(() =>
      expect(unitCashApi.getAccount).toHaveBeenCalledTimes(1),
    );

    renderHook(() => useUnitCashAccount("LIVE_CHICKEN"), {
      wrapper: createWrapper(qc),
    });
    await waitFor(() =>
      expect(unitCashApi.getAccount).toHaveBeenCalledTimes(2),
    );

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["unit-general-cash", "EGG", "account"]);
    expect(keys).toContainEqual([
      "unit-general-cash",
      "LIVE_CHICKEN",
      "account",
    ]);
  });

  it("includes the range and frequency in the flow key", async () => {
    const qc = newQueryClient();

    renderHook(() => useUnitCashFlow("EGG", start, end, "weekly"), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(unitCashApi.getFlow).toHaveBeenCalledTimes(1));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual([
      "unit-general-cash",
      "EGG",
      "flow",
      {
        start: start.toISOString(),
        end: end.toISOString(),
        frequency: "weekly",
      },
    ]);
  });

  it("scopes the reconciliation preview by unit", async () => {
    const qc = newQueryClient();

    renderHook(() => useUnitCashReconciliationPreview("EGG"), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() =>
      expect(unitCashApi.getReconciliationPreview).toHaveBeenCalledTimes(1),
    );

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(["unit-general-cash", "EGG", "reconciliation"]);
  });

  it("scopes alerts and adjustments by unit and range", async () => {
    const qc = newQueryClient();

    renderHook(() => useUnitCashAlerts("LIVE_CHICKEN"), {
      wrapper: createWrapper(qc),
    });
    renderHook(() => useUnitCashAdjustments("LIVE_CHICKEN", start, end), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(unitCashApi.getAlerts).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(unitCashApi.getAdjustments).toHaveBeenCalledTimes(1),
    );

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual([
      "unit-general-cash",
      "LIVE_CHICKEN",
      "alerts",
    ]);
    expect(keys).toContainEqual([
      "unit-general-cash",
      "LIVE_CHICKEN",
      "adjustments",
      { start: start.toISOString(), end: end.toISOString() },
    ]);
  });

  it("scopes cuts by unit and range", async () => {
    const qc = newQueryClient();

    renderHook(() => useUnitCashCuts("EGG", start, end), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(unitCashApi.getCuts).toHaveBeenCalledTimes(1));

    const keys = qc
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual([
      "unit-general-cash",
      "EGG",
      "cuts",
      { start: start.toISOString(), end: end.toISOString() },
    ]);
  });
});
