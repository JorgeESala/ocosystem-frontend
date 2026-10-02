import { describe, expect, it } from "vitest";
import { buildAttentionItems } from "../utils/attention";
import type { BranchesDashboardDTO } from "../api/branchesDashboard.types";

const baseDashboard = (
  overrides: Partial<BranchesDashboardDTO> = {},
): BranchesDashboardDTO => ({
  startDate: "2026-09-01",
  endDate: "2026-09-07",
  previousStartDate: "2026-08-25",
  previousEndDate: "2026-08-31",
  summary: {
    totalSales: 0,
    previousTotalSales: null,
    chickenSales: 0,
    previousChickenSales: null,
    otherProductsSales: 0,
    previousOtherProductsSales: null,
    chickenCosts: 0,
    chickenProfit: 0,
    mermaLossQuantity: 0,
    trimmedBranches: 0,
  },
  coverage: {
    totalBranches: 0,
    branchesWithPosReport: 0,
    branchesWithChickenSales: 0,
  },
  branches: [],
  daily: [],
  ...overrides,
});

const branch = (
  overrides: Partial<BranchesDashboardDTO["branches"][number]> = {},
): BranchesDashboardDTO["branches"][number] => ({
  branchId: 1,
  branchName: "Norte",
  totalSales: 1000,
  previousTotalSales: 900,
  chickenSales: 500,
  otherProductsSales: 500,
  chickenPosSales: 500,
  posDays: 7,
  chickenDays: 7,
  mermaLossQuantity: 0,
  reconciliationStatus: "MATCH",
  chickenVariancePct: 0,
  comparisonTrimmed: false,
  trimmedDays: 0,
  ...overrides,
});

describe("buildAttentionItems", () => {
  it("flags branches without a POS report as critical missing reports", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [branch({ posDays: 0 })],
      }),
      expectedDays: 7,
      tasks: [],
      slug: "sucursales",
      today: "2026-09-30",
    });

    const item = items.find((entry) => entry.kind === "MISSING_REPORT");
    expect(item).toBeTruthy();
    expect(item?.severity).toBe("critical");
    expect(item?.branchName).toBe("Norte");
    expect(item?.detail).toContain("0 de 7");
    expect(item?.to).toBe("/business/sucursales/upload-reports?branch=1");
  });

  it("flags partial POS coverage as warning", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [branch({ posDays: 3 })],
      }),
      expectedDays: 7,
      tasks: [],
      slug: "sucursales",
      today: "2026-09-30",
    });

    const item = items.find((entry) => entry.kind === "MISSING_REPORT");
    expect(item?.severity).toBe("warning");
    expect(item?.detail).toContain("3 de 7");
  });

  it("flags chicken differences with severity by variance", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [
          branch({
            branchId: 1,
            branchName: "Baja",
            reconciliationStatus: "DIFFERENCE",
            chickenVariancePct: 2.5,
          }),
          branch({
            branchId: 2,
            branchName: "Alta",
            reconciliationStatus: "DIFFERENCE",
            chickenVariancePct: 8.1,
          }),
        ],
      }),
      expectedDays: 7,
      tasks: [],
      slug: "sucursales",
      today: "2026-09-30",
    });

    const differences = items.filter(
      (entry) => entry.kind === "CHICKEN_DIFFERENCE",
    );
    expect(differences).toHaveLength(2);

    const low = differences.find((entry) => entry.branchName === "Baja");
    const high = differences.find((entry) => entry.branchName === "Alta");
    expect(low?.severity).toBe("warning");
    expect(low?.detail).toContain("2.5%");
    expect(high?.severity).toBe("critical");
    expect(high?.to).toBe(
      "/business/sucursales/profit?branches=2&start=2026-09-01&end=2026-09-07",
    );
  });

  it("does not duplicate incomplete reconciliation when the report is already missing", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [
          branch({
            branchId: 1,
            branchName: "Sin POS",
            posDays: 0,
            reconciliationStatus: "INCOMPLETE",
          }),
        ],
      }),
      expectedDays: 7,
      tasks: [],
      slug: "sucursales",
      today: "2026-09-30",
    });

    expect(
      items.filter((entry) => entry.kind === "CHICKEN_INCOMPLETE"),
    ).toHaveLength(0);
    const missing = items.find((entry) => entry.kind === "MISSING_REPORT");
    expect(missing?.severity).toBe("critical");
  });

  it("flags incomplete chicken reconciliation when coverage is complete", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [
          branch({
            branchId: 2,
            branchName: "Sin remesas",
            posDays: 7,
            chickenDays: 0,
            reconciliationStatus: "INCOMPLETE",
          }),
        ],
      }),
      expectedDays: 7,
      tasks: [],
      slug: "sucursales",
      today: "2026-09-30",
    });

    const incomplete = items.filter(
      (entry) => entry.kind === "CHICKEN_INCOMPLETE",
    );
    expect(incomplete).toHaveLength(1);
    expect(incomplete[0].detail).toContain("Entradas y ventas");
  });

  it("includes pending tasks and marks late ones as critical", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard(),
      expectedDays: 7,
      tasks: [
        {
          branchId: 1,
          branchName: "Norte",
          pending: 3,
          late: 1,
          onlyUploadPending: false,
        },
        {
          branchId: 2,
          branchName: "Sur",
          pending: 0,
          late: 0,
          onlyUploadPending: false,
        },
      ],
      slug: "sucursales",
      today: "2026-09-30",
    });

    const taskItems = items.filter((entry) => entry.kind === "PENDING_TASKS");
    expect(taskItems).toHaveLength(1);
    expect(taskItems[0].severity).toBe("critical");
    expect(taskItems[0].detail).toContain("3");
    expect(taskItems[0].detail).toContain("1 fuera de tiempo");
    expect(taskItems[0].to).toBe(
      "/business/sucursales/mis-tareas?branch=1&date=2026-09-30",
    );
  });

  it("still reports tasks when the dashboard request failed", () => {
    const items = buildAttentionItems({
      dashboard: null,
      expectedDays: 7,
      tasks: [
        {
          branchId: 1,
          branchName: "Norte",
          pending: 1,
          late: 0,
          onlyUploadPending: false,
        },
      ],
      slug: "sucursales",
      today: "2026-09-30",
    });

    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("PENDING_TASKS");
  });

  it("skips the task row when only the upload is pending and the report is missing", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [branch({ branchId: 1, branchName: "Norte", posDays: 0 })],
      }),
      expectedDays: 7,
      tasks: [
        {
          branchId: 1,
          branchName: "Norte",
          pending: 1,
          late: 1,
          onlyUploadPending: true,
        },
      ],
      slug: "sucursales",
      today: "2026-09-30",
    });

    expect(
      items.filter((entry) => entry.kind === "PENDING_TASKS"),
    ).toHaveLength(0);
    expect(
      items.filter((entry) => entry.kind === "MISSING_REPORT"),
    ).toHaveLength(1);
  });

  it("keeps the task row when other tasks are pending besides the upload", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [branch({ branchId: 1, branchName: "Norte", posDays: 0 })],
      }),
      expectedDays: 7,
      tasks: [
        {
          branchId: 1,
          branchName: "Norte",
          pending: 3,
          late: 0,
          onlyUploadPending: false,
        },
      ],
      slug: "sucursales",
      today: "2026-09-30",
    });

    expect(
      items.filter((entry) => entry.kind === "PENDING_TASKS"),
    ).toHaveLength(1);
  });

  it("keeps the upload-only task row when the report is not missing", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [branch({ branchId: 1, branchName: "Norte", posDays: 7 })],
      }),
      expectedDays: 7,
      tasks: [
        {
          branchId: 1,
          branchName: "Norte",
          pending: 1,
          late: 1,
          onlyUploadPending: true,
        },
      ],
      slug: "sucursales",
      today: "2026-09-30",
    });

    const taskItems = items.filter((entry) => entry.kind === "PENDING_TASKS");
    expect(taskItems).toHaveLength(1);
    expect(taskItems[0].severity).toBe("critical");
  });

  it("sorts items by severity with critical first", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({
        branches: [
          branch({
            branchId: 1,
            branchName: "Diferencia leve",
            reconciliationStatus: "DIFFERENCE",
            chickenVariancePct: 1.5,
          }),
        ],
      }),
      expectedDays: 7,
      tasks: [
        {
          branchId: 2,
          branchName: "Sur",
          pending: 2,
          late: 1,
          onlyUploadPending: false,
        },
      ],
      slug: "sucursales",
      today: "2026-09-30",
    });

    expect(items.map((entry) => entry.severity)).toEqual([
      "critical",
      "warning",
    ]);
  });

  it("does not flag coverage when the branch has a full report", () => {
    const items = buildAttentionItems({
      dashboard: baseDashboard({ branches: [branch({ posDays: 7 })] }),
      expectedDays: 7,
      tasks: [],
      slug: "sucursales",
      today: "2026-09-30",
    });

    expect(items).toHaveLength(0);
  });
});
