import { describe, expect, it } from "vitest";
import { compareVersions, versionStatus } from "../utils/version";

describe("compareVersions", () => {
  it("compares numeric segments, not strings", () => {
    expect(compareVersions("1.6.10", "1.6.9")).toBeGreaterThan(0);
    expect(compareVersions("1.6.2", "1.6.2")).toBe(0);
    expect(compareVersions("v1.5.0", "1.6.0")).toBeLessThan(0);
  });
});

describe("versionStatus", () => {
  it("flags outdated, current and unknown versions", () => {
    expect(versionStatus("1.6.2", "1.6.3")).toBe("outdated");
    expect(versionStatus("1.6.3", "1.6.3")).toBe("current");
    expect(versionStatus("1.6.4", "1.6.3")).toBe("current");
    expect(versionStatus(null, "1.6.3")).toBe("unknown");
    expect(versionStatus("1.6.3", undefined)).toBe("unknown");
  });
});
