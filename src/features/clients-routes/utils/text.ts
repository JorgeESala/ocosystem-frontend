export const normalizeText = (value: string | null | undefined): string =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const includesNormalized = (
  haystack: string | null | undefined,
  needle: string,
): boolean => normalizeText(haystack).includes(normalizeText(needle));
