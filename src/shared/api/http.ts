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

  // 1. Manejo de Autenticación (Lo que ya tenías)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Lógica de Multi-tenancy: Detectar el área por la URL
  // Buscamos si la ruta actual empieza con alguno de nuestros prefijos
  const tenantKey = Object.keys(TENANT_MAP).find((prefix) =>
    currentPath.startsWith(prefix),
  );

  if (tenantKey) {
    config.headers["X-Business-Code"] = TENANT_MAP[tenantKey];
  } else {
    // Si no estamos en una ruta específica, podemos enviar "public"
    // para que el Backend no pierda tiempo adivinando.
    config.headers["X-Business-Code"] = "public";
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
