import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "./notification.api";
import { notificationKeys } from "./notification.keys";

export const useNotificationSummary = (branchIds: number[]) =>
  useQuery({
    queryKey: notificationKeys.summary(branchIds),
    queryFn: () => notificationApi.getSummary(branchIds),
    enabled: branchIds.length > 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

export const useNotifications = (branchIds: number[]) =>
  useQuery({
    queryKey: notificationKeys.list(branchIds),
    queryFn: () => notificationApi.getAll(branchIds),
    enabled: branchIds.length > 0,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (branchIds: number[]) =>
      notificationApi.markAllAsRead(branchIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useCheckAlerts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (branchIds: number[]) => notificationApi.checkAlerts(branchIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useNotificationDetail = (id: number | null) =>
  useQuery({
    queryKey: notificationKeys.detail(id ?? 0),
    queryFn: () => notificationApi.getDetail(id!),
    enabled: id !== null,
  });

export const useNotificationHistory = (branchIds: number[], enabled: boolean) =>
  useQuery({
    queryKey: notificationKeys.history(branchIds),
    queryFn: () => notificationApi.getHistory(branchIds, 0, 20),
    enabled: enabled && branchIds.length > 0,
  });
