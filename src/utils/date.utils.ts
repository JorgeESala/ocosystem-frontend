export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
/* =======================
   UI date formatting
======================= */

export const toApiDateRange = (start: Date, end: Date) => {
  const s = new Date(start);
  const e = new Date(end);

  s.setHours(0, 0, 0, 0);
  e.setHours(23, 59, 59, 999);

  return {
    startDate: s.toISOString(),
    endDate: e.toISOString(),
  };
};

export type UiDateFormat = "short" | "long" | "relative";

export const formatDateToISO = (date: Date) => {
  return date.toISOString().substring(0, 10);
};

export const formatUiDate = (
  date: Date,
  format: UiDateFormat = "short",
): string => {
  const today = startOfDay(new Date());
  const target = startOfDay(date);

  if (format === "relative") {
    const diffDays = (target.getTime() - today.getTime()) / 86400000;

    if (diffDays === 0) return "hoy";
    if (diffDays === -1) return "ayer";
    if (diffDays === 1) return "mañana";
  }

  const options: Intl.DateTimeFormatOptions =
    format === "long"
      ? {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      : {
          day: "2-digit",
          month: "short",
          year: "numeric",
        };

  return new Intl.DateTimeFormat("es-MX", options).format(date);
};

/* =======================
   Human readable dates
======================= */

export type HumanDateFormat = "short" | "long" | "relative";

export const formatHumanDate = (
  input: string | Date,
  format: HumanDateFormat = "short",
): string => {
  const date =
    typeof input === "string" ? new Date(`${input}T00:00:00`) : input;

  const now = new Date();

  if (format === "relative") {
    const diffDays = Math.floor(
      (date.getTime() - startOfDay(now).getTime()) / 86400000,
    );

    if (diffDays === 0) return "hoy";
    if (diffDays === -1) return "ayer";
    if (diffDays === 1) return "mañana";
  }

  const options: Intl.DateTimeFormatOptions =
    format === "long"
      ? {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      : {
          day: "2-digit",
          month: "short",
          year: "numeric",
        };

  return new Intl.DateTimeFormat("es-MX", options).format(date);
};

/* =======================
   Helpers
======================= */

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const stringToDate = (date: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};
export const getLastDays = (days: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return { start, end };
};
export const getDayName = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00"); // Añadimos la hora para evitar desfases de zona horaria
  return new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(date);
};

export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00");
  const dayName = getDayName(dateString);
  const dayNumber = date.getDate();
  const month = new Intl.DateTimeFormat("es-MX", { month: "short" }).format(
    date,
  );

  // Capitalizamos la primera letra
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayNumber} ${month}`;
};
