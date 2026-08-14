import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: vi.fn(),
}));

import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useNotificationStream } from "../api/useNotificationStream";
import { notificationKeys } from "../api/notification.keys";

const mockedFetchEventSource = vi.mocked(fetchEventSource);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("token", "test-token");
  mockedFetchEventSource.mockResolvedValue(undefined);
});

afterEach(() => {
  localStorage.removeItem("token");
});

describe("useNotificationStream", () => {
  it("does not connect when branchIds is empty", async () => {
    const qc = createQueryClient();
    const wrapper = createWrapper(qc);

    renderHook(() => useNotificationStream([]), { wrapper });

    await new Promise((r) => setTimeout(r, 100));
    expect(mockedFetchEventSource).not.toHaveBeenCalled();
  });

  it("does not connect when there is no token", async () => {
    localStorage.removeItem("token");
    const qc = createQueryClient();
    const wrapper = createWrapper(qc);

    renderHook(() => useNotificationStream([1]), { wrapper });

    await new Promise((r) => setTimeout(r, 100));
    expect(mockedFetchEventSource).not.toHaveBeenCalled();
  });

  it("connects with correct URL and headers", async () => {
    const qc = createQueryClient();
    const wrapper = createWrapper(qc);

    renderHook(() => useNotificationStream([1, 2]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockedFetchEventSource.mock.calls[0][0];
    expect(callArgs).toContain("/api/v1/notifications/stream");

    const options = mockedFetchEventSource.mock.calls[0][1];
    expect(options.method).toBe("GET");
    expect(options.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer test-token",
        Accept: "text/event-stream",
      }),
    );
  });

  it("handles notification event by updating summary and list cache", async () => {
    const qc = createQueryClient();
    qc.setQueryData(notificationKeys.summary([1]), {
      unreadCount: 0,
      recent: [],
    });
    qc.setQueryData(notificationKeys.list([1]), []);

    let onmessage:
      | ((event: { event: string; data: string }) => void)
      | undefined;

    mockedFetchEventSource.mockImplementation(async (_url, opts) => {
      onmessage = opts?.onmessage as typeof onmessage;
      return undefined;
    });

    const wrapper = createWrapper(qc);
    renderHook(() => useNotificationStream([1]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalled();
    });

    const notification = {
      id: 10,
      branchId: 1,
      branchName: "Test",
      alertType: "LOW_BALANCE",
      severity: "warning",
      message: "Saldo bajo",
      read: false,
      createdAt: "2026-01-01T00:00:00",
    };

    act(() => {
      onmessage?.({
        event: "notification",
        data: JSON.stringify(notification),
      });
    });

    const summary = qc.getQueryData(notificationKeys.summary([1])) as {
      unreadCount: number;
      recent: { id: number }[];
    };
    expect(summary.unreadCount).toBe(1);
    expect(summary.recent).toHaveLength(1);
    expect(summary.recent[0].id).toBe(10);

    const list = qc.getQueryData(notificationKeys.list([1])) as {
      id: number;
    }[];
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(10);
  });

  it("updates existing notification when same id arrives", async () => {
    const qc = createQueryClient();
    qc.setQueryData(notificationKeys.summary([1]), {
      unreadCount: 1,
      recent: [
        {
          id: 10,
          branchId: 1,
          branchName: "Test",
          alertType: "LOW_BALANCE",
          severity: "warning",
          message: "old",
          read: false,
          createdAt: "",
        },
      ],
    });

    let onmessage:
      | ((event: { event: string; data: string }) => void)
      | undefined;
    mockedFetchEventSource.mockImplementation(async (_url, opts) => {
      onmessage = opts?.onmessage as typeof onmessage;
      return undefined;
    });

    const wrapper = createWrapper(qc);
    renderHook(() => useNotificationStream([1]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalled();
    });

    const updated = {
      id: 10,
      branchId: 1,
      branchName: "Test",
      alertType: "LOW_BALANCE",
      severity: "critical",
      message: "updated",
      read: false,
      createdAt: "2026-01-01T00:00:00",
    };

    act(() => {
      onmessage?.({ event: "notification", data: JSON.stringify(updated) });
    });

    const summary = qc.getQueryData(notificationKeys.summary([1])) as {
      unreadCount: number;
      recent: { id: number; message: string; severity: string }[];
    };
    expect(summary.unreadCount).toBe(1);
    expect(summary.recent).toHaveLength(1);
    expect(summary.recent[0].message).toBe("updated");
    expect(summary.recent[0].severity).toBe("critical");
  });

  it("handles notification-cleared event by removing from caches", async () => {
    const qc = createQueryClient();
    qc.setQueryData(notificationKeys.summary([1]), {
      unreadCount: 2,
      recent: [
        {
          id: 10,
          branchId: 1,
          branchName: "A",
          alertType: "LOW_BALANCE",
          severity: "warning",
          message: "a",
          read: false,
          createdAt: "",
        },
        {
          id: 20,
          branchId: 1,
          branchName: "A",
          alertType: "HIGH_WASTE",
          severity: "critical",
          message: "b",
          read: false,
          createdAt: "",
        },
      ],
    });
    qc.setQueryData(notificationKeys.list([1]), [
      {
        id: 10,
        branchId: 1,
        branchName: "A",
        alertType: "LOW_BALANCE",
        severity: "warning",
        message: "a",
        read: false,
        createdAt: "",
      },
      {
        id: 20,
        branchId: 1,
        branchName: "A",
        alertType: "HIGH_WASTE",
        severity: "critical",
        message: "b",
        read: false,
        createdAt: "",
      },
    ]);

    let onmessage:
      | ((event: { event: string; data: string }) => void)
      | undefined;
    mockedFetchEventSource.mockImplementation(async (_url, opts) => {
      onmessage = opts?.onmessage as typeof onmessage;
      return undefined;
    });

    const wrapper = createWrapper(qc);
    renderHook(() => useNotificationStream([1]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalled();
    });

    act(() => {
      onmessage?.({
        event: "notification-cleared",
        data: JSON.stringify({
          notificationId: 10,
          branchId: 1,
          alertType: "LOW_BALANCE",
        }),
      });
    });

    const summary = qc.getQueryData(notificationKeys.summary([1])) as {
      unreadCount: number;
      recent: { id: number }[];
    };
    expect(summary.unreadCount).toBe(1);
    expect(summary.recent).toHaveLength(1);
    expect(summary.recent[0].id).toBe(20);

    const list = qc.getQueryData(notificationKeys.list([1])) as {
      id: number;
    }[];
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(20);
  });

  it("handles summary-update event by updating unread count", async () => {
    const qc = createQueryClient();
    qc.setQueryData(notificationKeys.summary([1]), {
      unreadCount: 5,
      recent: [],
    });

    let onmessage:
      | ((event: { event: string; data: string }) => void)
      | undefined;
    mockedFetchEventSource.mockImplementation(async (_url, opts) => {
      onmessage = opts?.onmessage as typeof onmessage;
      return undefined;
    });

    const wrapper = createWrapper(qc);
    renderHook(() => useNotificationStream([1]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalled();
    });

    act(() => {
      onmessage?.({
        event: "summary-update",
        data: JSON.stringify({ unreadCount: 8 }),
      });
    });

    const summary = qc.getQueryData(notificationKeys.summary([1])) as {
      unreadCount: number;
    };
    expect(summary.unreadCount).toBe(8);
  });

  it("does not update cache when summary data is undefined", async () => {
    const qc = createQueryClient();

    let onmessage:
      | ((event: { event: string; data: string }) => void)
      | undefined;
    mockedFetchEventSource.mockImplementation(async (_url, opts) => {
      onmessage = opts?.onmessage as typeof onmessage;
      return undefined;
    });

    const wrapper = createWrapper(qc);
    renderHook(() => useNotificationStream([1]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalled();
    });

    expect(() => {
      act(() => {
        onmessage?.({
          event: "notification",
          data: JSON.stringify({
            id: 1,
            branchId: 1,
            branchName: "A",
            alertType: "LOW_BALANCE",
            severity: "warning",
            message: "x",
            read: false,
            createdAt: "",
          }),
        });
      });
    }).not.toThrow();
  });

  it("ignores notification event for a branch not in branchIds", async () => {
    const qc = createQueryClient();
    qc.setQueryData(notificationKeys.summary([1]), {
      unreadCount: 0,
      recent: [],
    });
    qc.setQueryData(notificationKeys.list([1]), []);

    let onmessage:
      | ((event: { event: string; data: string }) => void)
      | undefined;
    mockedFetchEventSource.mockImplementation(async (_url, opts) => {
      onmessage = opts?.onmessage as typeof onmessage;
      return undefined;
    });

    const wrapper = createWrapper(qc);
    renderHook(() => useNotificationStream([1]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalled();
    });

    act(() => {
      onmessage?.({
        event: "notification",
        data: JSON.stringify({
          id: 10,
          branchId: 999,
          branchName: "Otra",
          alertType: "LOW_BALANCE",
          severity: "warning",
          message: "otra sucursal",
          read: false,
          createdAt: "",
        }),
      });
    });

    const summary = qc.getQueryData(notificationKeys.summary([1])) as {
      unreadCount: number;
      recent: { id: number }[];
    };
    expect(summary.unreadCount).toBe(0);
    expect(summary.recent).toHaveLength(0);

    const list = qc.getQueryData(notificationKeys.list([1])) as {
      id: number;
    }[];
    expect(list).toHaveLength(0);
  });

  it("does not re-add a notification the user already read", async () => {
    const qc = createQueryClient();
    qc.setQueryData(notificationKeys.summary([1]), {
      unreadCount: 0,
      recent: [],
    });
    qc.setQueryData(notificationKeys.list([1]), []);

    let onmessage:
      | ((event: { event: string; data: string }) => void)
      | undefined;
    mockedFetchEventSource.mockImplementation(async (_url, opts) => {
      onmessage = opts?.onmessage as typeof onmessage;
      return undefined;
    });

    const wrapper = createWrapper(qc);
    renderHook(() => useNotificationStream([1]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalled();
    });

    act(() => {
      onmessage?.({
        event: "notification",
        data: JSON.stringify({
          id: 10,
          branchId: 1,
          branchName: "A",
          alertType: "HIGH_WASTE",
          severity: "warning",
          message: "Merma elevada en A: 350 gramos por pollo",
          read: true,
          createdAt: "",
        }),
      });
    });

    const summary = qc.getQueryData(notificationKeys.summary([1])) as {
      unreadCount: number;
      recent: { id: number }[];
    };
    expect(summary.unreadCount).toBe(0);
    expect(summary.recent).toHaveLength(0);

    const list = qc.getQueryData(notificationKeys.list([1])) as {
      id: number;
    }[];
    expect(list).toHaveLength(0);
  });

  it("ignores notification-cleared event for a branch not in branchIds", async () => {
    const qc = createQueryClient();
    qc.setQueryData(notificationKeys.summary([1]), {
      unreadCount: 1,
      recent: [
        {
          id: 10,
          branchId: 1,
          branchName: "A",
          alertType: "LOW_BALANCE",
          severity: "warning",
          message: "a",
          read: false,
          createdAt: "",
        },
      ],
    });
    qc.setQueryData(notificationKeys.list([1]), [
      {
        id: 10,
        branchId: 1,
        branchName: "A",
        alertType: "LOW_BALANCE",
        severity: "warning",
        message: "a",
        read: false,
        createdAt: "",
      },
    ]);

    let onmessage:
      | ((event: { event: string; data: string }) => void)
      | undefined;
    mockedFetchEventSource.mockImplementation(async (_url, opts) => {
      onmessage = opts?.onmessage as typeof onmessage;
      return undefined;
    });

    const wrapper = createWrapper(qc);
    renderHook(() => useNotificationStream([1]), { wrapper });

    await waitFor(() => {
      expect(mockedFetchEventSource).toHaveBeenCalled();
    });

    act(() => {
      onmessage?.({
        event: "notification-cleared",
        data: JSON.stringify({
          notificationId: 10,
          branchId: 999,
          alertType: "LOW_BALANCE",
        }),
      });
    });

    const summary = qc.getQueryData(notificationKeys.summary([1])) as {
      unreadCount: number;
      recent: { id: number }[];
    };
    expect(summary.unreadCount).toBe(1);
    expect(summary.recent).toHaveLength(1);

    const list = qc.getQueryData(notificationKeys.list([1])) as {
      id: number;
    }[];
    expect(list).toHaveLength(1);
  });
});
