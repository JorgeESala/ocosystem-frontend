import axios from "axios";
import { triggerUnauthorized } from "@/shared/auth/unauthorized";

export const API_URL = import.meta.env.VITE_API_URL;

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Mapeo de prefijos de ruta a códigos de esquema
const TENANT_MAP: { [key: string]: string } = {
  "/business/sucursales": "branches",
  "/business/pollo-vivo": "live_chicken",
  "/business/huevo": "egg",
  "/business/pig": "pig",
  "/business/groceries": "groceries",
};

// REQUEST interceptor
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const currentPath = window.location.pathname;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!config.headers["X-Business-Code"]) {
    const tenantKey = Object.keys(TENANT_MAP).find((prefix) =>
      currentPath.startsWith(prefix),
    );
    config.headers["X-Business-Code"] = tenantKey
      ? TENANT_MAP[tenantKey]
      : "public";
  }

  return config;
});

// RESPONSE interceptor
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      triggerUnauthorized();
    }
    return Promise.reject(error);
  },
);
