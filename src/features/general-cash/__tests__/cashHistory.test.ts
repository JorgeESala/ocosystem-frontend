import { describe, expect, it } from "vitest";
import {
  cashHistoryLabel,
  filterPosReportedSales,
  isPosReportedSale,
} from "../utils/cashHistory";

describe("cashHistory utilities", () => {
  it("identifies POS-reported sales of other products", () => {
    const entry = {
      entryType: "INCOME_SALES",
      sourceType: "POS_REPORTED_SALES",
    };

    expect(isPosReportedSale(entry)).toBe(true);
    expect(cashHistoryLabel(entry)).toBe("POS otros productos");
  });

  it("keeps the regular labels for other entries", () => {
    expect(
      cashHistoryLabel({ entryType: "INCOME_SALES", sourceType: "SALE" }),
    ).toBe("Venta");
    expect(
      cashHistoryLabel({
        entryType: "EXPENSE_OPERATIONAL",
        sourceType: "EXPENSE",
      }),
    ).toBe("Gasto");
    expect(
      cashHistoryLabel({ entryType: "PAYMENT_OUT", sourceType: "PAYMENT" }),
    ).toBe("Pago");
    expect(
      cashHistoryLabel({ entryType: "OTHER", sourceType: "ADJUSTMENT" }),
    ).toBe("Ajuste");
  });

  it("does not treat null source types as POS-reported sales", () => {
    expect(
      isPosReportedSale({ entryType: "INCOME_SALES", sourceType: null }),
    ).toBe(false);
  });

  it("filters POS-reported sales out of the history without mutating balances", () => {
    const entries = [
      { entryType: "INCOME_SALES", sourceType: "SALE" },
      { entryType: "INCOME_SALES", sourceType: "POS_REPORTED_SALES" },
    ];

    expect(filterPosReportedSales(entries, true)).toHaveLength(2);
    const filtered = filterPosReportedSales(entries, false);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].sourceType).toBe("SALE");
    expect(entries).toHaveLength(2);
  });
});
