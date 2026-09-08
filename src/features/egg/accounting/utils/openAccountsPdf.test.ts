import { describe, expect, it } from "vitest";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import {
  buildMonthlyHtml,
  buildOpenAccountsHtml,
  buildStatementHtml,
  toFileName,
} from "./openAccountsPdf";

describe("toFileName", () => {
  it("slugifies Spanish names", () => {
    expect(toFileName("Felipe Carrillo puerto")).toBe("felipe-carrillo-puerto");
    expect(toFileName("José María Morelos")).toBe("jose-maria-morelos");
  });

  it("collapses separators and drops symbols", () => {
    expect(toFileName("  Reporte: Roneli / Junio!  ")).toBe(
      "reporte-roneli-junio",
    );
  });

  it("keeps digits and dashes", () => {
    expect(toFileName("2026-06-01 al 2026-06-30")).toBe(
      "2026-06-01-al-2026-06-30",
    );
  });
});

const account = {
  id: 1,
  creditorId: 10,
  creditorName: "Felipe Carrillo puerto",
  debtorId: 20,
  debtorName: "Express FCP",
  totalAmount: 9490,
  balance: 2992,
  date: "2026-08-10",
  note: "nota",
};

describe("buildOpenAccountsHtml", () => {
  it("formats money like the app and drops the Origen column", () => {
    const html = buildOpenAccountsHtml([account], "Título", "ahora");
    expect(html).toContain(formatMXN(9490));
    expect(html).toContain(formatMXN(2992));
    expect(html).not.toContain("Origen");
    expect(html).toContain(formatHumanDate("2026-08-10", "short"));
    expect(html).toContain("ahora");
  });
});

describe("buildStatementHtml", () => {
  it("formats money and short Spanish dates", () => {
    const html = buildStatementHtml(
      account,
      [
        {
          key: "movement-3",
          movementDate: "2026-08-12",
          movementType: "PAYMENT",
          amount: 1500,
          balanceAfter: 7990,
          folio: null,
          note: null,
        },
      ],
      "ahora",
    );
    expect(html).toContain(formatMXN(1500));
    expect(html).toContain(formatHumanDate("2026-08-12", "short"));
  });
});

describe("buildMonthlyHtml", () => {
  it("formats balances and range dates", () => {
    const html = buildMonthlyHtml(
      {
        debtorName: "Roneli",
        from: "2026-06-01",
        to: "2026-06-30",
        openingBalance: 1100,
        totalCharges: 2000,
        totalPayments: 400,
        closingBalance: 2700,
        movements: [],
      },
      "ahora",
    );
    expect(html).toContain(formatMXN(2700));
    expect(html).toContain(formatHumanDate("2026-06-01", "short"));
    expect(html).toContain(formatHumanDate("2026-06-30", "short"));
  });
});
