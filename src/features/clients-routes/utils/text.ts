export const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const includesNormalized = (haystack: string, needle: string): boolean =>
  normalizeText(haystack).includes(normalizeText(needle));
