export const DEFAULT_WEEKLY_CASH_TARGET = 1000;

export const formatDate = (iso: string): string => {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const currentWeekStart = (): Date => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
};

export const currentWeekRange = (): { start: Date; end: Date } => {
  const start = currentWeekStart();
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

export const previousWeekRange = (): { start: Date; end: Date } => {
  const start = currentWeekStart();
  start.setDate(start.getDate() - 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

export const latestFridayWeekRange = (
  reference: Date = new Date(),
): { start: Date; end: Date } => {
  const end = new Date(reference);
  end.setHours(0, 0, 0, 0);
  const daysSinceFriday = (end.getDay() - 5 + 7) % 7;
  end.setDate(end.getDate() - daysSinceFriday);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start, end };
};

const holderName = (
  accountHolder: string | null | undefined,
): string | null => {
  const name = accountHolder?.trim();
  if (!name || name.toLowerCase() === "titular") {
    return null;
  }
  return name;
};

export const accountLabel = (
  accountHolder: string | null | undefined,
): string => {
  const name = holderName(accountHolder);
  return name ? `la cuenta de ${name}` : "la cuenta del titular";
};

export const accountLabelShort = (
  accountHolder: string | null | undefined,
): string => {
  const name = holderName(accountHolder);
  return name ? `Cuenta de ${name}` : "Cuenta del titular";
};
