import type { BusinessType } from "../business/business.types";

export interface AuthUser {
  id: number;
  name: string;
  allowedBusinesses: BusinessType[];
}
