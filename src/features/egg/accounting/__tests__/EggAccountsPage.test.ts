import { describe, expect, it } from "vitest";
import { modeFromParam } from "../utils/accountingMode";

describe("EggAccountsPage mode", () => {
  it("maps the legacy cobranza links to the collections tab", () => {
    expect(modeFromParam("COBRANZA")).toBe("COLLECTIONS");
    expect(modeFromParam("COBRAR")).toBe("COLLECTIONS");
    expect(modeFromParam("COLLECTIONS")).toBe("COLLECTIONS");
  });

  it("keeps the other accounting views", () => {
    expect(modeFromParam("PAYABLE")).toBe("PAYABLE");
    expect(modeFromParam("FINANCIAL")).toBe("FINANCIAL");
    expect(modeFromParam(null)).toBe("RECEIVABLE");
    expect(modeFromParam("UNKNOWN")).toBe("RECEIVABLE");
  });
});
