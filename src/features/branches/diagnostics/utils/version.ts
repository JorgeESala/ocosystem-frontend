export type VersionStatus = "unknown" | "current" | "outdated";

export function compareVersions(a: string, b: string): number {
  const normalize = (value: string) =>
    value
      .replace(/^v/, "")
      .split(".")
      .map((part) => {
        const parsed = Number.parseInt(part, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      });

  const left = normalize(a);
  const right = normalize(b);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const x = left[index] ?? 0;
    const y = right[index] ?? 0;
    if (x !== y) return x - y;
  }
  return 0;
}

export function versionStatus(
  last: string | null,
  latest: string | null | undefined,
): VersionStatus {
  if (!last || !latest) return "unknown";
  return compareVersions(last, latest) >= 0 ? "current" : "outdated";
}
