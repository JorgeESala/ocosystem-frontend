import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useNotificationSummary,
  useNotificationDetail,
  useNotificationHistory,
  useDismissNotification,
} from "../api/notification.queries";
import { notificationApi } from "../api/notification.api";

vi.mock("../api/notification.api", () => ({
  notificationApi: {
    getSummary: vi.fn(),
    getAll: vi.fn(),
    getDetail: vi.fn(),
    getHistory: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    dismiss: vi.fn(),
    checkAlerts: vi.fn(),
  },
}));

const mockedApi = vi.mocked(notificationApi);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper() {
  const qc = createQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useNotificationSummary", () => {
  it("fetches summary when branchIds is non-empty", async () => {
    const summary = { unreadCount: 2, recent: [] };
    mockedApi.getSummary.mockResolvedValue(summary);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotificationSummary([1, 2]), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(summary);
    expect(mockedApi.getSummary).toHaveBeenCalledWith([1, 2]);
  });

  it("does not fetch when branchIds is empty", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotificationSummary([]), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedApi.getSummary).not.toHaveBeenCalled();
  });
});

describe("useNotificationDetail", () => {
  it("fetches detail when id is not null", async () => {
    const detail = { alertType: "HIGH_WASTE", branchId: 1, branchName: "Test", detail: {} };
    mockedApi.getDetail.mockResolvedValue(detail);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotificationDetail(5), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(detail);
  });

  it("does not fetch when id is null", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotificationDetail(null), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedApi.getDetail).not.toHaveBeenCalled();
  });
});

describe("useNotificationHistory", () => {
  it("fetches history when enabled and branchIds non-empty", async () => {
    const page = { content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } };
    mockedApi.getHistory.mockResolvedValue(page);

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useNotificationHistory([1], true),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.getHistory).toHaveBeenCalledWith([1], 0, 20);
  });

  it("does not fetch when disabled", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useNotificationHistory([1], false),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useDismissNotification", () => {
  it("optimistically removes notification from summary cache", async () => {
    const qc = createQueryClient();
    qc.setQueryData(["notifications", "summary", [1]], {
      unreadCount: 3,
      recent: [
        { id: 10, branchId: 1, branchName: "A", alertType: "LOW_BALANCE", severity: "warning", message: "test", read: false, createdAt: "" },
        { id: 20, branchId: 1, branchName: "A", alertType: "HIGH_WASTE", severity: "critical", message: "test2", read: false, createdAt: "" },
      ],
    });

    mockedApi.dismiss.mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDismissNotification(), { wrapper });

    await act(async () => {
      result.current.mutate(10);
      await waitFor(() => result.current.isSuccess);
    });

    const data = qc.getQueryData(["notifications", "summary", [1]]) as {
      unreadCount: number;
      recent: { id: number }[];
    };
    expect(data.unreadCount).toBe(2);
    expect(data.recent).toHaveLength(1);
    expect(data.recent[0].id).toBe(20);
  });
});
