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

export const currentWeekEnd = (): Date => {
  const start = currentWeekStart();
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

export const previousWeekRange = (): { start: Date; end: Date } => {
  const start = currentWeekStart();
  start.setDate(start.getDate() - 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};
