import { describe, expect, it } from "vitest";
import { businessRootPath, logoTargetFor } from "../business.navigation";

describe("business navigation", () => {
  it("builds the business root path from a slug", () => {
    expect(businessRootPath("sucursales")).toBe("/business/sucursales");
    expect(businessRootPath("huevo")).toBe("/business/huevo");
  });

  it("sends branches-only users straight to the dashboard", () => {
    expect(logoTargetFor(["BRANCHES"])).toBe("/business/sucursales");
  });

  it("keeps the default home for every other case", () => {
    expect(logoTargetFor(["EGG"])).toBe("/");
    expect(logoTargetFor(["BRANCHES", "EGG"])).toBe("/");
    expect(logoTargetFor([])).toBe("/");
    expect(logoTargetFor(undefined)).toBe("/");
  });
});
