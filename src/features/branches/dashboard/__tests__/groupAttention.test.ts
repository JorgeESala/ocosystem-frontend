import { describe, expect, it } from "vitest";
import { groupAttentionItems } from "../utils/attention";
import type { AttentionItem } from "../utils/attention";

const item = (overrides: Partial<AttentionItem> = {}): AttentionItem => ({
  id: "MISSING_REPORT-1",
  kind: "MISSING_REPORT",
  severity: "warning",
  branchId: 1,
  branchName: "Norte",
  title: "Cobertura parcial de reportes",
  detail: "6 de 7 días con reporte",
  to: "/business/sucursales/upload-reports?branch=1",
  ...overrides,
});

describe("groupAttentionItems", () => {
  it("groups identical items into one group", () => {
    const groups = groupAttentionItems([
      item({ id: "a-1", branchId: 1, branchName: "Norte" }),
      item({ id: "a-2", branchId: 2, branchName: "Sur" }),
      item({ id: "a-3", branchId: 3, branchName: "Centro" }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(3);
    expect(groups[0].severity).toBe("warning");
    expect(groups[0].branchNames).toEqual(["Norte", "Sur", "Centro"]);
  });

  it("does not merge different severities or titles", () => {
    const groups = groupAttentionItems([
      item({ id: "a-1", branchId: 1, branchName: "Norte" }),
      item({
        id: "b-1",
        branchId: 1,
        branchName: "Norte",
        severity: "critical",
        title: "Sin reporte de ventas",
        detail: "0 de 7 días con reporte",
      }),
      item({
        id: "c-1",
        branchId: 1,
        branchName: "Norte",
        kind: "PENDING_TASKS",
        title: "Tareas pendientes",
        detail: "3 pendientes",
        to: "/business/sucursales/mis-tareas?branch=1&date=2026-09-30",
      }),
    ]);

    expect(groups).toHaveLength(3);
  });

  it("keeps the item link for singleton groups", () => {
    const groups = groupAttentionItems([
      item({ id: "a-1", to: "/business/sucursales/upload-reports?branch=1" }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].to).toBe("/business/sucursales/upload-reports?branch=1");
    expect(groups[0].detail).toBe("6 de 7 días con reporte");
  });

  it("summarizes uniform details with the branch count", () => {
    const groups = groupAttentionItems([
      item({ id: "a-1", branchId: 1, branchName: "Norte" }),
      item({ id: "a-2", branchId: 2, branchName: "Sur" }),
    ]);

    expect(groups[0].detail).toBe("6 de 7 días con reporte · 2 sucursales");
    expect(groups[0].to).toBe("/business/sucursales/upload-reports");
  });

  it("summarizes mixed details with branch names", () => {
    const groups = groupAttentionItems([
      item({
        id: "a-1",
        branchId: 1,
        branchName: "Norte",
        detail: "3 pendientes",
      }),
      item({
        id: "a-2",
        branchId: 2,
        branchName: "Sur",
        detail: "5 pendientes",
      }),
      item({
        id: "a-3",
        branchId: 3,
        branchName: "Centro",
        detail: "1 pendiente",
      }),
      item({
        id: "a-4",
        branchId: 4,
        branchName: "Oriente",
        detail: "2 pendientes",
      }),
    ]);

    expect(groups[0].detail).toBe("4 sucursales: Norte, Sur, Centro +1 más");
  });

  it("orders groups by severity, then size", () => {
    const groups = groupAttentionItems([
      item({ id: "a-1", branchId: 1, branchName: "Norte" }),
      item({ id: "a-2", branchId: 2, branchName: "Sur" }),
      item({
        id: "b-1",
        branchId: 3,
        branchName: "Centro",
        severity: "critical",
        title: "Sin reporte de ventas",
      }),
      item({
        id: "c-1",
        branchId: 4,
        branchName: "Oriente",
        kind: "PENDING_TASKS",
        severity: "info",
        title: "Tareas pendientes",
        detail: "1 pendiente",
        to: null,
      }),
    ]);

    expect(groups.map((group) => group.title)).toEqual([
      "Sin reporte de ventas",
      "Cobertura parcial de reportes",
      "Tareas pendientes",
    ]);
    expect(groups[2].to).toBeNull();
  });

  it("returns an empty list without items", () => {
    expect(groupAttentionItems([])).toEqual([]);
  });
});
