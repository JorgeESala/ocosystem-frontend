export const formatScore = (
  n: number | null | undefined,
  digits = 1,
): string => {
  if (n == null || Number.isNaN(n)) {
    return "—";
  }
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const formatPercent = (
  n: number | null | undefined,
  digits = 1,
): string => {
  if (n == null || Number.isNaN(n)) {
    return "—";
  }
  return `${formatScore(n, digits)}%`;
};
