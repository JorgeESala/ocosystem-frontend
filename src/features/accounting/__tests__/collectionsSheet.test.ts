import { describe, it, expect, vi, afterEach } from "vitest";
import { buildCollectionsSheetHtml } from "../utils/collectionsSheet";
import type { CollectionsSheetInput } from "../utils/collectionsSheet";

const baseInput: CollectionsSheetInput = {
  routeName: "Ruta Norte",
  businessUnitName: "Huevo",
  dateLabel: "15 oct 2026",
  rows: [
    {
      displayName: "Express Chunhuhub",
      entityType: "BRANCH",
      saldoRuta: 500,
      saldoTotal: 620,
      phone: null,
    },
    {
      displayName: "Doña María",
      entityType: "EGGCLIENT",
      saldoRuta: 300,
      saldoTotal: 300,
      phone: "811-000-1234",
    },
  ],
  totalRuta: 800,
};

describe("collectionsSheet", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders deudores, route total and footer totals", () => {
    const html = buildCollectionsSheetHtml(baseInput);

    expect(html).toContain("Express Chunhuhub");
    expect(html).toContain("Doña María");
    expect(html).toContain("811-000-1234");
    expect(html).toContain("Total a cobrar en la ruta: $800.00");
    expect(html.match(/\$800\.00/g)).toHaveLength(2);
    expect(html).toContain("$920.00");
    expect(html).toContain("Sucursal");
    expect(html).toContain("Cliente");
  });

  it("escapes html in names", () => {
    const html = buildCollectionsSheetHtml({
      ...baseInput,
      routeName: "<script>alert(1)</script>",
    });

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("handles missing phones and empty rows", () => {
    const html = buildCollectionsSheetHtml({
      ...baseInput,
      rows: [],
      totalRuta: 0,
    });

    expect(html).toContain("0 deudores");
    expect(html).toContain("$0.00");
  });
});
