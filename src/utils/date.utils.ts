export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
/* =======================
   UI date formatting
======================= */

export type UiDateFormat = "short" | "long" | "relative";

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
   Helpers
======================= */

/* =======================
   LocalDate helpers
======================= */

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
