export const getCurrentWeek = (today: Date = new Date()): { from: Date; to: Date } => {
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7;
  const from = new Date(today);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - diffToMonday);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from, to };
};

export const getLastWeek = (today: Date = new Date()): { from: Date; to: Date } => {
  const current = getCurrentWeek(today);
  const from = new Date(current.from);
  from.setDate(from.getDate() - 7);
  const to = new Date(current.to);
  to.setDate(to.getDate() - 7);
  return { from, to };
};

export const getLast7Days = (today: Date = new Date()): { from: Date; to: Date } => {
  const to = new Date(today);
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);
  return { from, to };
};

export const getLast30Days = (today: Date = new Date()): { from: Date; to: Date } => {
  const to = new Date(today);
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  from.setHours(0, 0, 0, 0);
  return { from, to };
};

export const getCurrentMonth = (today: Date = new Date()): { from: Date; to: Date } => {
  const from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
};

export const toIsoDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const fromIsoDateString = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
