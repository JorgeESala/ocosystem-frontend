import { describe, expect, it } from "vitest";
import {
  applyAccountSort,
  buildAccountSearchText,
  filterAccountsBySearch,
  statementRowLabel,
} from "./openAccounts";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";

const row = (
  overrides: Partial<AccountsPayableResponse>,
): AccountsPayableResponse => ({
  id: 1,
  creditorId: 10,
  creditorName: "Felipe Carrillo puerto",
  debtorId: 20,
  debtorName: "Express FCP",
  totalAmount: 9490,
  balance: 2992,
  date: "2026-08-10",
  note: "Remesa semanal",
  ...overrides,
});

describe("buildAccountSearchText", () => {
  it("includes names, note, source, ids and amounts", () => {
    const text = buildAccountSearchText(row({}));
    expect(text).toContain("express fcp");
    expect(text).toContain("9490");
    expect(text).toContain("2992");
    expect(text).toContain("remesa semanal");
  });
});

describe("filterAccountsBySearch", () => {
  const rows = [
    row({ id: 1, totalAmount: 9490, balance: 2992 }),
    row({ id: 2, debtorName: "Otro cliente", totalAmount: 500, balance: 500 }),
  ];

  it("matches by amount", () => {
    expect(filterAccountsBySearch(rows, "9490").map((r) => r.id)).toEqual([1]);
  });

  it("matches by name case-insensitively", () => {
    expect(filterAccountsBySearch(rows, "OTRO").map((r) => r.id)).toEqual([2]);
  });

  it("returns all on blank query", () => {
    expect(filterAccountsBySearch(rows, "  ")).toHaveLength(2);
  });
});

describe("statementRowLabel", () => {
  it("labels known movement types in Spanish", () => {
    expect(statementRowLabel("PAYMENT")).toBe("Pago");
    expect(statementRowLabel("COMPENSATION")).toBe("Compensación");
    expect(statementRowLabel("CHARGE")).toBe("Cargo");
  });

  it("falls back to the raw code", () => {
    expect(statementRowLabel("WEIRD")).toBe("WEIRD");
  });
});

describe("applyAccountSort", () => {
  const rows = [
    row({ id: 1, date: "2026-08-10", totalAmount: 9490, balance: 2992 }),
    row({ id: 2, date: "2026-08-01", totalAmount: 500, balance: 100 }),
  ];

  it("sorts by total desc", () => {
    expect(applyAccountSort(rows, "total", "desc").map((r) => r.id)).toEqual([
      1, 2,
    ]);
  });

  it("sorts by balance asc", () => {
    expect(applyAccountSort(rows, "balance", "asc").map((r) => r.id)).toEqual([
      2, 1,
    ]);
  });

  it("sorts by date desc without mutating input", () => {
    const copy = [...rows];
    const sorted = applyAccountSort(rows, "date", "desc");
    expect(sorted.map((r) => r.id)).toEqual([1, 2]);
    expect(rows).toEqual(copy);
  });
});
