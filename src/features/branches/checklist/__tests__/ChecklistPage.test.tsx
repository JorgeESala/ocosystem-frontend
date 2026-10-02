import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChecklistPage from "../pages/ChecklistPage";
import { getCurrentWeek } from "../utils/week";
import { toIsoDateString } from "../utils/week";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    performanceCalls: [] as unknown[],
  },
}));

vi.mock("../api/checklist.queries", () => ({
  useBranchPerformance: (args: unknown) => {
    mocks.performanceCalls.push(args);
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      isFetching: false,
    };
  },
}));

vi.mock("@/features/branches/branch/branch.queries", () => ({
  useBranches: () => ({
    data: [
      { id: 1, name: "Norte" },
      { id: 2, name: "Sur" },
    ],
    isLoading: false,
  }),
}));

vi.mock("../api/excluded-branches.queries", () => ({
  useExcludedBranches: () => ({ data: [] }),
}));

vi.mock("@/hooks/useAuthRole", () => ({
  useAuthRole: () => ({ isAdmin: false }),
}));

const renderPage = (entry: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <ChecklistPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("ChecklistPage scope params", () => {
  it("applies scope and dates from params", () => {
    mocks.performanceCalls = [];

    renderPage(
      "/business/sucursales/checklist?branches=2&start=2026-09-01&end=2026-09-07",
    );

    expect(mocks.performanceCalls).toContainEqual({
      from: "2026-09-01",
      to: "2026-09-07",
      branchIds: [2],
      includeDays: false,
    });
  });

  it("keeps the current week and every branch without params", () => {
    mocks.performanceCalls = [];
    const week = getCurrentWeek();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const expectedTo =
      week.to.getTime() > endOfToday.getTime() ? new Date() : week.to;

    renderPage("/business/sucursales/checklist");

    expect(mocks.performanceCalls).toContainEqual({
      from: toIsoDateString(week.from),
      to: toIsoDateString(expectedTo),
      branchIds: [1, 2],
      includeDays: false,
    });
  });
});
