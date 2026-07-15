import type { ExpectedEventType } from "./expected-event.types";

export interface ScheduleTemplate {
  id?: number;
  branchId: number;
  branchName?: string | null;
  eventType: ExpectedEventType;
  dayOfWeek: number;
  cutoffTime?: string | null;
  note?: string | null;
  createdBy?: number | null;
}

export const DAY_OF_WEEK_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;
