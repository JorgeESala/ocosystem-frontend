const DAY_MS = 86_400_000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function formatRelativeDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / DAY_MS,
  );
  const time = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (diffDays <= 0) return `hoy ${time}`;
  if (diffDays === 1) return `ayer ${time}`;
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

export function formatLongDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
