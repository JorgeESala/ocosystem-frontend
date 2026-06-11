import type { ChecklistTaskEntry } from "../types/checklist.types";

export type UrgencyLevel = "done" | "light" | "mid" | "deep";

export interface UrgencyInfo {
  level: UrgencyLevel;
  label: string;
}

const HOUR_MS = 1000 * 60 * 60;

const formatRelative = (ms: number): string => {
  const hours = Math.floor(ms / HOUR_MS);
  if (hours < 1) {
    const minutes = Math.max(1, Math.floor(ms / (1000 * 60)));
    return `hace ${minutes} min`;
  }
  if (hours < 24) {
    return `hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
};

const formatTime = (iso: string): string =>
  new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));

export const getUrgency = (
  task: ChecklistTaskEntry,
  now: Date = new Date(),
): UrgencyInfo => {
  if (task.status === "DONE") {
    return { level: "done", label: task.detail || "Completado" };
  }

  if (!task.dueAt) {
    return { level: "light", label: task.detail || "Pendiente" };
  }

  const dueAt = new Date(task.dueAt).getTime();
  const nowMs = now.getTime();
  const diff = nowMs - dueAt;

  if (diff <= 0) {
    return {
      level: "light",
      label: `Vence a las ${formatTime(task.dueAt)}`,
    };
  }

  if (diff <= 4 * HOUR_MS) {
    return {
      level: "mid",
      label: `Vencido ${formatRelative(diff)}`,
    };
  }

  return {
    level: "deep",
    label: `Vencido ${formatRelative(diff)} · cargar cuanto antes`,
  };
};
