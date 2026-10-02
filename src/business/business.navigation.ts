import { BUSINESSES } from "./business.config";
import type { BusinessType } from "./business.types";

export const businessRootPath = (slug: string): string => `/business/${slug}`;

export const logoTargetFor = (
  allowedBusinesses: BusinessType[] | undefined,
): string => {
  if (allowedBusinesses?.length === 1 && allowedBusinesses[0] === "BRANCHES") {
    const branches = BUSINESSES.find((b) => b.key === "BRANCHES");
    if (branches) return businessRootPath(branches.slug);
  }
  return "/";
};
