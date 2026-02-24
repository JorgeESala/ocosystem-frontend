import axios from "axios";
import { triggerUnauthorized } from "@/shared/auth/unauthorized";

export const API_URL = import.meta.env.VITE_API_URL;

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// REQUEST interceptor
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
