import { describe, expect, it } from "vitest";
import { salesReportKeys } from "../api/salesReports.keys";

describe("salesReportKeys.expected", () => {
  it("scopes the expected sales key by branches and dates", () => {
    const start = new Date(2026, 5, 1);
    const end = new Date(2026, 5, 7);

    expect(salesReportKeys.expected([1, 2], start, end)).toEqual([
      ...salesReportKeys.all,
      "expected",
      { branchIds: [1, 2], startDate: start, endDate: end },
    ]);
  });
});
