import { useAuth } from "../context/AuthContext";

export function useAuthRole() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  return { isAdmin };
}
