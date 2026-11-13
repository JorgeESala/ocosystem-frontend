import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useClientPagination } from "../useClientPagination";

const items = Array.from({ length: 60 }, (_, index) => index);

describe("useClientPagination", () => {
  it("paginates and changes page size", () => {
    const { result } = renderHook(() =>
      useClientPagination(items, { pageSize: 25, resetKey: "a" }),
    );

    expect(result.current.pageItems).toHaveLength(25);
    expect(result.current.from).toBe(1);
    expect(result.current.to).toBe(25);

    act(() => result.current.setPage(1));
    expect(result.current.page).toBe(1);
    expect(result.current.pageItems[0]).toBe(25);

    act(() => result.current.setPageSize(50));
    expect(result.current.page).toBe(0);
    expect(result.current.pageItems).toHaveLength(50);
  });

  it("resets the page when the reset key changes", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => useClientPagination(items, { pageSize: 25, resetKey }),
      { initialProps: { resetKey: "a" } },
    );

    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);

    rerender({ resetKey: "b" });
    expect(result.current.page).toBe(0);
  });

  it("clamps the page when the list shrinks", () => {
    const { result, rerender } = renderHook(
      ({ rows }) => useClientPagination(rows, { pageSize: 25 }),
      { initialProps: { rows: items } },
    );

    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);

    rerender({ rows: items.slice(0, 10) });
    expect(result.current.page).toBe(0);
  });
});
