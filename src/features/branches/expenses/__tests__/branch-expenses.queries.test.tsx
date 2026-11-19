import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchExpenseAnalytics } from "../api/branch-expenses.queries";
import type { BranchExpenseAnalyticsRequest } from "../types";

const mocks = vi.hoisted(() => ({
  analytics: vi.fn(),
}));

vi.mock("../api/branch-expenses.api", () => ({
  branchExpensesApi: {
    analytics: mocks.analytics,
  },
}));

const request: BranchExpenseAnalyticsRequest = {
  branchIds: [1],
  businessUnitCategoryIds: [2],
  expenseCategoryIds: [3],
  reason: "gas",
  startDate: new Date(2026, 0, 1),
  endDate: new Date(2026, 0, 31),
  granularity: "MONTH",
  includeNonOperating: false,
};

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useBranchExpenseAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.analytics.mockResolvedValue({
      current: { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
      previous: { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
      amountDifference: 0,
      amountVariationPct: null,
      countDifference: 0,
      countVariationPct: null,
      buckets: [],
      categories: [],
      branches: [],
      businessUnits: [],
    });
  });

  it("queries the analytics endpoint when a request is enabled", async () => {
    const { result } = renderHook(
      () => useBranchExpenseAnalytics(request),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.analytics).toHaveBeenCalledWith(request);
  });

  it("defaults a missing reason to an empty string", async () => {
    const withoutReason = { ...request, reason: undefined };

    const { result } = renderHook(
      () => useBranchExpenseAnalytics(withoutReason),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.analytics).toHaveBeenCalledWith(withoutReason);
  });

  it("stays disabled without a request", () => {
    const { result } = renderHook(() => useBranchExpenseAnalytics(null), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mocks.analytics).not.toHaveBeenCalled();
  });
});
