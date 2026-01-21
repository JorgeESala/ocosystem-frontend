import type { AuthUser } from "./auth.types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
