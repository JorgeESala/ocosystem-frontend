import { useEffect, useRef, useCallback, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "./notification.keys";
import type { NotificationDTO, AlertType } from "../types";

interface NotificationSSEEvent {
  id: number;
  branchId: number;
  branchName: string;
  alertType: AlertType;
  severity: "critical" | "warning";
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationClearedEvent {
  type: "cleared";
  notificationId: number;
  branchId: number;
  alertType: string;
}

interface SummaryUpdateEvent {
  unreadCount: number;
}

export function useNotificationStream(branchIds: number[]) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const branchIdsKey = branchIds.slice().sort().join(",");
  const [isConnected, setIsConnected] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "";

  const getTenantCode = useCallback(() => {
    const TENANT_MAP: Record<string, string> = {
      "/business/sucursales": "branches",
      "/business/pollo-vivo": "live_chicken",
      "/business/huevo": "egg",
      "/business/pig": "pig",
      "/business/groceries": "groceries",
    };

    const currentPath = window.location.pathname;
    const tenantKey = Object.keys(TENANT_MAP).find((prefix) =>
      currentPath.startsWith(prefix),
    );
    return tenantKey ? TENANT_MAP[tenantKey] : "public";
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  const connect = useCallback(async () => {
    if (branchIds.length === 0) return;

    const token = getToken();
    if (!token) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const tenantCode = getTenantCode();
    const url = `${API_URL}/api/v1/notifications/stream`;

    try {
      await fetchEventSource(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Business-Code": tenantCode,
          Accept: "text/event-stream",
        },
        signal: abortControllerRef.current.signal,
        openWhenHidden: true,
        onopen: async (response) => {
          if (response.ok) {
            reconnectAttemptsRef.current = 0;
            setIsConnected(true);
          }
        },
        onmessage: (event) => {
          const eventName = event.event;

          if (eventName === "connected") {
            return;
          }

          if (eventName === "notification") {
            const data: NotificationSSEEvent = JSON.parse(event.data);
            const notification: NotificationDTO = {
              id: data.id,
              branchId: data.branchId,
              branchName: data.branchName,
              alertType: data.alertType,
              severity: data.severity,
              message: data.message,
              read: data.read,
              createdAt: data.createdAt,
            };

            queryClient.setQueryData(
              notificationKeys.summary(branchIds),
              (old: { unreadCount: number; recent: NotificationDTO[] } | undefined) => {
                if (!old) return old;
                const exists = old.recent.some((n) => n.id === notification.id);
                if (exists) {
                  return {
                    ...old,
                    recent: old.recent.map((n) =>
                      n.id === notification.id ? notification : n,
                    ),
                  };
                }
                return {
                  unreadCount: old.unreadCount + (notification.read ? 0 : 1),
                  recent: [notification, ...old.recent].slice(0, 20),
                };
              },
            );

            queryClient.setQueryData(
              notificationKeys.list(branchIds),
              (old: NotificationDTO[] | undefined) => {
                if (!old) return old;
                const exists = old.some((n) => n.id === notification.id);
                if (exists) {
                  return old.map((n) =>
                    n.id === notification.id ? notification : n,
                  );
                }
                return [notification, ...old];
              },
            );
          } else if (eventName === "notification-cleared") {
            const data: NotificationClearedEvent = JSON.parse(event.data);

            queryClient.setQueryData(
              notificationKeys.summary(branchIds),
              (old: { unreadCount: number; recent: NotificationDTO[] } | undefined) => {
                if (!old) return old;
                return {
                  unreadCount: Math.max(0, old.unreadCount - 1),
                  recent: old.recent.filter(
                    (n) => n.id !== data.notificationId,
                  ),
                };
              },
            );

            queryClient.setQueryData(
              notificationKeys.list(branchIds),
              (old: NotificationDTO[] | undefined) => {
                if (!old) return old;
                return old.filter((n) => n.id !== data.notificationId);
              },
            );
          } else if (eventName === "summary-update") {
            const data: SummaryUpdateEvent = JSON.parse(event.data);
            queryClient.setQueryData(
              notificationKeys.summary(branchIds),
              (old: { unreadCount: number; recent: NotificationDTO[] } | undefined) => {
                if (!old) return old;
                return { ...old, unreadCount: data.unreadCount };
              },
            );
          }
        },
        onerror: (err) => {
          console.error("SSE error:", err);
          setIsConnected(false);
        },
        onclose: () => {
          setIsConnected(false);
          if (abortControllerRef.current?.signal.aborted) return;

          const maxAttempts = 10;
          const baseDelay = 1000;
          const maxDelay = 30000;

          if (reconnectAttemptsRef.current < maxAttempts) {
            const delay = Math.min(
              baseDelay * Math.pow(2, reconnectAttemptsRef.current),
              maxDelay,
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          }
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }, [branchIdsKey, queryClient, API_URL, getTenantCode, getToken]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, [connect]);

  return { isConnected };
}
