import { buildScopeSearch } from "@/utils/scopeParams";
import type { BranchesDashboardDTO } from "../api/branchesDashboard.types";

export type AttentionSeverity = "critical" | "warning" | "info";

export type AttentionKind =
  | "MISSING_REPORT"
  | "CHICKEN_DIFFERENCE"
  | "CHICKEN_INCOMPLETE"
  | "PENDING_TASKS";

export interface BranchTaskSummary {
  branchId: number;
  branchName: string;
  pending: number;
  late: number;
}

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  severity: AttentionSeverity;
  branchId: number | null;
  branchName: string;
  title: string;
  detail: string;
  to: string | null;
}

interface BuildAttentionInput {
  dashboard: BranchesDashboardDTO | null | undefined;
  expectedDays: number;
  tasks: BranchTaskSummary[];
  slug: string;
  today: string;
}

const SEVERITY_RANK: Record<AttentionSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const DIFFERENCE_CRITICAL_PCT = 5;

export const MAX_VISIBLE_ATTENTION_ITEMS = 5;

export const buildAttentionItems = ({
  dashboard,
  expectedDays,
  tasks,
  slug,
  today,
}: BuildAttentionInput): AttentionItem[] => {
  const items: AttentionItem[] = [];

  const periodStart = dashboard?.startDate
    ? new Date(`${dashboard.startDate}T00:00:00`)
    : null;
  const periodEnd = dashboard?.endDate
    ? new Date(`${dashboard.endDate}T00:00:00`)
    : null;
  const profitScope = (branchId: number) =>
    periodStart && periodEnd
      ? `/business/${slug}/profit?${buildScopeSearch([branchId], periodStart, periodEnd)}`
      : `/business/${slug}/profit`;

  for (const branch of dashboard?.branches ?? []) {
    const missingDays =
      expectedDays > 0 ? Math.max(0, expectedDays - branch.posDays) : 0;

    if (missingDays > 0) {
      items.push({
        id: `MISSING_REPORT-${branch.branchId}`,
        kind: "MISSING_REPORT",
        severity: branch.posDays === 0 ? "critical" : "warning",
        branchId: branch.branchId,
        branchName: branch.branchName,
        title:
          branch.posDays === 0
            ? "Sin reporte de ventas"
            : "Cobertura parcial de reportes",
        detail: `${branch.posDays} de ${expectedDays} días con reporte`,
        to: `/business/${slug}/upload-reports?branch=${branch.branchId}`,
      });
    }

    if (branch.reconciliationStatus === "DIFFERENCE") {
      const variance = branch.chickenVariancePct ?? 0;
      items.push({
        id: `CHICKEN_DIFFERENCE-${branch.branchId}`,
        kind: "CHICKEN_DIFFERENCE",
        severity: variance >= DIFFERENCE_CRITICAL_PCT ? "critical" : "warning",
        branchId: branch.branchId,
        branchName: branch.branchName,
        title: "Diferencia de pollo entre fuentes",
        detail: `${variance.toFixed(1)}% entre Subir reporte y Entradas y ventas`,
        to: profitScope(branch.branchId),
      });
    }
  }

  const branchesMissingReport = new Set(
    items
      .filter((entry) => entry.kind === "MISSING_REPORT")
      .map((entry) => entry.branchId),
  );

  for (const branch of dashboard?.branches ?? []) {
    if (branch.reconciliationStatus !== "INCOMPLETE") continue;
    if (branchesMissingReport.has(branch.branchId)) continue;
    items.push({
      id: `CHICKEN_INCOMPLETE-${branch.branchId}`,
      kind: "CHICKEN_INCOMPLETE",
      severity: "info",
      branchId: branch.branchId,
      branchName: branch.branchName,
      title: "Conciliación de pollo incompleta",
      detail: "Faltan ventas de pollo en Entradas y ventas",
      to: profitScope(branch.branchId),
    });
  }

  for (const task of tasks) {
    if (task.pending <= 0) continue;
    items.push({
      id: `PENDING_TASKS-${task.branchId}`,
      kind: "PENDING_TASKS",
      severity: task.late > 0 ? "critical" : "warning",
      branchId: task.branchId,
      branchName: task.branchName,
      title: "Tareas pendientes",
      detail: `${task.pending} pendiente${task.pending === 1 ? "" : "s"}${
        task.late > 0 ? `, ${task.late} fuera de tiempo` : ""
      }`,
      to: `/business/${slug}/mis-tareas?branch=${task.branchId}&date=${today}`,
    });
  }

  return items.sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
};

export interface AttentionGroup {
  key: string;
  kind: AttentionKind;
  severity: AttentionSeverity;
  title: string;
  detail: string;
  branchNames: string[];
  to: string | null;
  items: AttentionItem[];
}

const groupDetail = (items: AttentionItem[]): string => {
  if (items.length === 1) return items[0].detail;
  const details = new Set(items.map((entry) => entry.detail));
  if (details.size === 1) {
    return `${items[0].detail} · ${items.length} sucursales`;
  }
  const names = items.map((entry) => entry.branchName);
  const shown = names.slice(0, 3).join(", ");
  const rest = names.length - 3;
  return `${names.length} sucursales: ${shown}${rest > 0 ? ` +${rest} más` : ""}`;
};

const groupLink = (items: AttentionItem[]): string | null => {
  if (items.length === 1) return items[0].to;
  const first = items[0].to;
  if (!first) return null;
  return first.split("?")[0];
};

export const groupAttentionItems = (
  items: AttentionItem[],
): AttentionGroup[] => {
  const byKey = new Map<string, AttentionItem[]>();
  const firstSeen = new Map<string, number>();
  for (const entry of items) {
    const key = `${entry.kind}:${entry.severity}:${entry.title}`;
    const group = byKey.get(key);
    if (group) {
      group.push(entry);
    } else {
      byKey.set(key, [entry]);
      firstSeen.set(key, firstSeen.size);
    }
  }

  const groups = [...byKey].map(([key, groupItems]) => {
    const [first] = groupItems;
    return {
      group: {
        key,
        kind: first.kind,
        severity: first.severity,
        title: first.title,
        detail: groupDetail(groupItems),
        branchNames: groupItems.map((entry) => entry.branchName),
        to: groupLink(groupItems),
        items: groupItems,
      } satisfies AttentionGroup,
      order: firstSeen.get(key) ?? 0,
    };
  });

  return groups
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.group.severity] - SEVERITY_RANK[b.group.severity] ||
        b.group.items.length - a.group.items.length ||
        a.order - b.order,
    )
    .map((entry) => entry.group);
};
