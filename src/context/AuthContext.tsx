import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, type LoginRequest } from "../services/api";
import { setUnauthorizedHandler } from "../services/authEvents";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  async function login(data: LoginRequest) {
    const res = await loginUser(data);
    setToken(res.token);
    localStorage.setItem("token", res.token);
  }

  function logout() {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  }

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
