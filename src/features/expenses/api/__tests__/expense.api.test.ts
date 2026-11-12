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
import { ExpenseCategoryCode } from "@/core/api/types";
import { expenseApi } from "../expense.api";

const mockedHttp = vi.mocked(http);

beforeEach(() => {
  vi.clearAllMocks();
});

const response = {
  current: { totalAmount: 150, expenseCount: 3, averageAmount: 50 },
  previous: { totalAmount: 110, expenseCount: 3, averageAmount: 36.67 },
  amountDifference: 40,
  amountVariationPct: 36.36,
  countDifference: 0,
  countVariationPct: 0,
  byCategory: [],
  byExpenseType: [],
};

describe("expenseApi.compare", () => {
  it("requests both periods as date-only params", async () => {
    mockedHttp.get.mockResolvedValue({ data: response });

    const result = await expenseApi.compare(
      new Date(2026, 9, 1),
      new Date(2026, 9, 31),
      new Date(2026, 8, 1),
      new Date(2026, 8, 30),
    );

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/expenses/comparison", {
      params: {
        start: "2026-10-01",
        end: "2026-10-31",
        previousStart: "2026-09-01",
        previousEnd: "2026-09-30",
      },
    });
    expect(result).toEqual(response);
  });

  it("sends category and expense-type filters", async () => {
    mockedHttp.get.mockResolvedValue({ data: response });

    await expenseApi.compare(
      new Date(2026, 9, 1),
      new Date(2026, 9, 31),
      new Date(2026, 8, 1),
      new Date(2026, 8, 30),
      [ExpenseCategoryCode.FUEL, ExpenseCategoryCode.FOOD],
      ["COMBUSTIBLE"],
    );

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/expenses/comparison", {
      params: {
        start: "2026-10-01",
        end: "2026-10-31",
        previousStart: "2026-09-01",
        previousEnd: "2026-09-30",
        categories: "FUEL,FOOD",
        expenseTypes: "COMBUSTIBLE",
      },
    });
  });
});
