import { describe, expect, it } from "vitest";
import { businessRootPath, logoTargetFor } from "../business.navigation";

describe("business navigation", () => {
  it("builds the business root path from a slug", () => {
    expect(businessRootPath("sucursales")).toBe("/business/sucursales");
    expect(businessRootPath("huevo")).toBe("/business/huevo");
  });

  it("sends single-business users straight to their unit home", () => {
    expect(logoTargetFor(["BRANCHES"])).toBe("/business/sucursales");
    expect(logoTargetFor(["EGG"])).toBe("/business/huevo");
  });

  it("uses the current business when there is one", () => {
    expect(logoTargetFor(["EGG", "BRANCHES"], "huevo")).toBe("/business/huevo");
    expect(logoTargetFor(["EGG", "BRANCHES"], "sucursales")).toBe(
      "/business/sucursales",
    );
  });

  it("keeps the unit picker when there is no current business", () => {
    expect(logoTargetFor(["BRANCHES", "EGG"])).toBe("/");
    expect(logoTargetFor([])).toBe("/");
    expect(logoTargetFor(undefined)).toBe("/");
    expect(logoTargetFor(["EGG"], null)).toBe("/business/huevo");
  });
});
