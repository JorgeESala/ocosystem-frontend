import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationBell from "../components/NotificationBell";

vi.mock("@/features/branches/branch/branch.queries", () => ({
  useBranches: vi.fn(() => ({
    data: [{ id: 1, name: "Sucursal A" }],
    isLoading: false,
  })),
}));

vi.mock("../api/notification.queries", () => ({
  useNotificationSummary: vi.fn(() => ({ data: { unreadCount: 0, recent: [] }, isLoading: false })),
  useMarkNotificationRead: vi.fn(() => ({ mutate: vi.fn() })),
  useMarkAllNotificationsRead: vi.fn(() => ({ mutate: vi.fn() })),
  useDismissNotification: vi.fn(() => ({ mutate: vi.fn() })),
  useCheckAlerts: vi.fn(() => ({ mutate: vi.fn() })),
  useNotificationDetail: vi.fn(() => ({ data: null, isLoading: false })),
}));

vi.mock("../api/useNotificationStream", () => ({
  useNotificationStream: vi.fn(() => ({ isConnected: true })),
}));

import { useNotificationSummary, useMarkAllNotificationsRead } from "../api/notification.queries";

const mockUseNotificationSummary = vi.mocked(useNotificationSummary);
const mockUseMarkAllNotificationsRead = vi.mocked(useMarkAllNotificationsRead);

function renderBell(summary: { unreadCount: number; recent: { id: number; branchId: number; branchName: string; alertType: string; severity: string; message: string; read: boolean; createdAt: string }[] }) {
  mockUseNotificationSummary.mockReturnValue({
    data: summary,
    isLoading: false,
  } as ReturnType<typeof useNotificationSummary>);

  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders bell icon button", () => {
    renderBell({ unreadCount: 0, recent: [] });
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows unread count badge when > 0", () => {
    renderBell({ unreadCount: 3, recent: [] });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows 9+ when count > 9", () => {
    renderBell({ unreadCount: 15, recent: [] });
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("does not show badge when count is 0", () => {
    renderBell({ unreadCount: 0, recent: [] });
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("opens dropdown on bell click and shows Notificaciones", () => {
    renderBell({ unreadCount: 1, recent: [] });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(screen.getByText("Notificaciones")).toBeInTheDocument();
  });

  it("shows empty state when no notifications", () => {
    renderBell({ unreadCount: 0, recent: [] });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(screen.getByText("Sin notificaciones")).toBeInTheDocument();
  });

  it("shows notification messages in dropdown", () => {
    renderBell({
      unreadCount: 1,
      recent: [
        {
          id: 10,
          branchId: 1,
          branchName: "Sucursal A",
          alertType: "LOW_BALANCE",
          severity: "warning",
          message: "Saldo bajo en caja",
          read: false,
          createdAt: "2026-01-01T00:00:00",
        },
      ],
    });

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(screen.getByText("Saldo bajo en caja")).toBeInTheDocument();
    expect(screen.getByText("Sucursal A")).toBeInTheDocument();
  });

  it("shows mark-all-read button when unread > 0", () => {
    renderBell({
      unreadCount: 1,
      recent: [{ id: 10, branchId: 1, branchName: "A", alertType: "LOW_BALANCE", severity: "warning", message: "x", read: false, createdAt: "" }],
    });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/Marcar todo/)).toBeInTheDocument();
  });

  it("calls markAllRead on mark-all-read click", () => {
    const mutate = vi.fn();
    mockUseMarkAllNotificationsRead.mockReturnValue({ mutate } as ReturnType<typeof useMarkAllNotificationsRead>);

    renderBell({
      unreadCount: 1,
      recent: [{ id: 10, branchId: 1, branchName: "A", alertType: "LOW_BALANCE", severity: "warning", message: "x", read: false, createdAt: "" }],
    });

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    fireEvent.click(screen.getByText(/Marcar todo/));
    expect(mutate).toHaveBeenCalledWith([1]);
  });

  it("shows historial button", () => {
    renderBell({ unreadCount: 0, recent: [] });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(screen.getByText("Historial")).toBeInTheDocument();
  });
});
