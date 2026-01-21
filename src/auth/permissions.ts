export type Role = "USER" | "ADMIN" | "MANAGER";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: [
    "VIEW_REPORTS",
    "VIEW_GRAPHS",
    "VIEW_SALES",
    "VIEW_EXPENSES",
    "VIEW_PROFIT",
  ],

  MANAGER: ["VIEW_REPORTS", "VIEW_GRAPHS", "VIEW_SALES", "VIEW_EXPENSES"],

  USER: ["VIEW_SALES"],
};
