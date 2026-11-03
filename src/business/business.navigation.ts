import { BUSINESSES } from "./business.config";
import type { BusinessType } from "./business.types";

export const businessRootPath = (slug: string): string => `/business/${slug}`;

export const logoTargetFor = (
  allowedBusinesses: BusinessType[] | undefined,
  currentBusinessSlug?: string | null,
): string => {
  if (currentBusinessSlug) {
    return businessRootPath(currentBusinessSlug);
  }
  if (allowedBusinesses?.length === 1) {
    const business = BUSINESSES.find((b) => b.key === allowedBusinesses[0]);
    if (business) return businessRootPath(business.slug);
  }
  return "/";
};
