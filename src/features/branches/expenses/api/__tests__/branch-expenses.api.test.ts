import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/http", () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  return {
    http: {
      get: mockGet,
      post: mockPost,
      put: mockPut,
    },
  };
});

import { http } from "@/shared/api/http";
import { branchExpensesApi } from "../branch-expenses.api";

const mockedHttp = vi.mocked(http);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("branchExpensesApi.comparison", () => {
  it("posts both periods, branches and the business unit", async () => {
    const response = {
      current: { totalAmount: 230, expenseCount: 4, averageAmount: 57.5 },
      previous: { totalAmount: 90, expenseCount: 2, averageAmount: 45 },
      amountDifference: 140,
      amountVariationPct: 155.56,
      countDifference: 2,
      countVariationPct: 100,
      branches: [],
      byCategory: [],
    };
    mockedHttp.post.mockResolvedValue({ data: response });

    const result = await branchExpensesApi.comparison({
      branchIds: [3, 4],
      businessUnitCategoryIds: [21, 22],
      expenseCategoryIds: [11, 12],
      reason: "gasolina",
      startDate: new Date(2026, 9, 1),
      endDate: new Date(2026, 9, 31),
      previousStartDate: new Date(2026, 8, 1),
      previousEndDate: new Date(2026, 8, 30),
    });

    expect(mockedHttp.post).toHaveBeenCalledWith("/api/expenses/comparison", {
      branchIds: [3, 4],
      businessUnitCategoryIds: [21, 22],
      expenseCategoryIds: [11, 12],
      reason: "gasolina",
      start: "2026-10-01",
      end: "2026-10-31",
      previousStart: "2026-09-01",
      previousEnd: "2026-09-30",
    });
    expect(result).toEqual(response);
  });
});
