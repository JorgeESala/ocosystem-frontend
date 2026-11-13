import { describe, expect, it } from "vitest";
import { getPageMeta, paginateItems } from "../pagination";

describe("getPageMeta", () => {
  it("describes the visible range", () => {
    expect(getPageMeta(116, 0, 25)).toEqual({
      page: 0,
      pageSize: 25,
      total: 116,
      pageCount: 5,
      from: 1,
      to: 25,
    });
    expect(getPageMeta(116, 4, 25)).toMatchObject({
      from: 101,
      to: 116,
    });
  });

  it("handles empty lists", () => {
    expect(getPageMeta(0, 0, 25)).toMatchObject({
      pageCount: 1,
      from: 0,
      to: 0,
    });
  });
});

describe("paginateItems", () => {
  it("returns only the requested page", () => {
    const items = Array.from({ length: 60 }, (_, index) => index);

    expect(paginateItems(items, 0, 25)).toHaveLength(25);
    expect(paginateItems(items, 2, 25)).toEqual(
      Array.from({ length: 10 }, (_, index) => index + 50),
    );
  });
});
