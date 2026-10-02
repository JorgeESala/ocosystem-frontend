import { describe, expect, it } from "vitest";
import {
  buildScopeSearch,
  parseDateParam,
  parseScopeParams,
} from "../scopeParams";

describe("parseScopeParams", () => {
  it("parses branch ids filtered by known branches", () => {
    const params = new URLSearchParams(
      "branches=1,2,99&start=2026-09-01&end=2026-09-07",
    );

    const result = parseScopeParams(params, [1, 2, 3]);

    expect(result.branchIds).toEqual([1, 2]);
    expect(result.start).toEqual(new Date(2026, 8, 1));
    expect(result.end).toEqual(new Date(2026, 8, 7));
  });

  it("ignores non-numeric branch ids", () => {
    const params = new URLSearchParams("branches=abc,,2.5,0,-3,4");

    const result = parseScopeParams(params, [1, 2, 3, 4]);

    expect(result.branchIds).toEqual([4]);
  });

  it("returns an empty scope without params", () => {
    const result = parseScopeParams(new URLSearchParams(), [1, 2]);

    expect(result).toEqual({ branchIds: [], start: null, end: null });
  });

  it("rejects ranges where the start is after the end", () => {
    const params = new URLSearchParams(
      "branches=1&start=2026-09-07&end=2026-09-01",
    );

    const result = parseScopeParams(params, [1]);

    expect(result.branchIds).toEqual([1]);
    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
  });

  it("rejects malformed dates but keeps valid branches", () => {
    const params = new URLSearchParams(
      "branches=1&start=2026-13-40&end=mañana",
    );

    const result = parseScopeParams(params, [1]);

    expect(result.branchIds).toEqual([1]);
    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
  });
});

describe("parseDateParam", () => {
  it("parses valid ISO dates", () => {
    expect(parseDateParam("2026-09-30")).toEqual(new Date(2026, 8, 30));
  });

  it("rejects empty and malformed values", () => {
    expect(parseDateParam(null)).toBeNull();
    expect(parseDateParam("")).toBeNull();
    expect(parseDateParam("30/09/2026")).toBeNull();
    expect(parseDateParam("2026-02-30")).toBeNull();
  });
});

describe("buildScopeSearch", () => {
  it("builds a query string with branches and range", () => {
    const search = buildScopeSearch(
      [1, 2],
      new Date(2026, 8, 1),
      new Date(2026, 8, 7),
    );

    expect(search).toBe("branches=1%2C2&start=2026-09-01&end=2026-09-07");
  });
});
