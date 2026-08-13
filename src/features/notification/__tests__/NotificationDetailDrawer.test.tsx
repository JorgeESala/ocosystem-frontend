import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotificationDetailDrawer } from "../components/NotificationDetailDrawer";

vi.mock("../api/notification.queries", () => ({
  useNotificationDetail: vi.fn(() => ({ data: null, isLoading: false })),
}));

import { useNotificationDetail } from "../api/notification.queries";

const mockUseNotificationDetail = vi.mocked(useNotificationDetail);

beforeEach(() => {
  vi.clearAllMocks();
});

function renderDrawer(
  overrides: {
    open?: boolean;
    notificationId?: number | null;
    alertType?: string | null;
    detailData?: unknown;
    isLoading?: boolean;
  } = {},
) {
  const {
    open = true,
    notificationId = 1,
    alertType = "HIGH_WASTE",
    detailData = null,
    isLoading = false,
  } = overrides;

  mockUseNotificationDetail.mockReturnValue({
    data: detailData
      ? { alertType, branchId: 1, branchName: "Test", detail: detailData }
      : null,
    isLoading,
  } as ReturnType<typeof useNotificationDetail>);

  return render(
    <NotificationDetailDrawer
      open={open}
      onClose={vi.fn()}
      notificationId={notificationId}
      alertType={
        alertType as "HIGH_WASTE" | "OVERDUE_TASKS" | "DELIVERY_NOT_RECEIVED"
      }
    />,
  );
}

describe("NotificationDetailDrawer", () => {
  it("shows spinner when loading", () => {
    renderDrawer({ isLoading: true });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows empty state when no detail data", () => {
    renderDrawer({ detailData: null });
    expect(
      screen.getByText("Sin datos detallados disponibles."),
    ).toBeInTheDocument();
  });

  it("renders title for HIGH_WASTE", () => {
    renderDrawer({ alertType: "HIGH_WASTE" });
    expect(screen.getByText("Detalle de merma")).toBeInTheDocument();
  });

  it("renders title for OVERDUE_TASKS", () => {
    renderDrawer({ alertType: "OVERDUE_TASKS" });
    expect(screen.getByText("Estado del checklist diario")).toBeInTheDocument();
  });

  it("renders title for DELIVERY_NOT_RECEIVED", () => {
    renderDrawer({ alertType: "DELIVERY_NOT_RECEIVED" });
    expect(screen.getByText("Estado de entrega")).toBeInTheDocument();
  });

  it("renders WasteDetailContent for HIGH_WASTE with detail", () => {
    renderDrawer({
      alertType: "HIGH_WASTE",
      detailData: {
        batchId: 1,
        entryDate: "2026-01-15",
        provider: "Proveedor A",
        chickensReceived: 50,
        kgTotal: 100,
        chickensSold: 40,
        kgSold: 80,
        kgGut: 5,
        mermaConTripa: 350,
        mermaSinTripa: 300,
        thresholdWarning: 240,
        thresholdCritical: 300,
        sales: [],
      },
    });
    expect(screen.getByText("Fecha de entrada")).toBeInTheDocument();
    expect(screen.getByText("Proveedor")).toBeInTheDocument();
    expect(screen.getByText("Indicadores de merma")).toBeInTheDocument();
  });

  it("renders ChecklistDetailContent for OVERDUE_TASKS with detail", () => {
    renderDrawer({
      alertType: "OVERDUE_TASKS",
      detailData: {
        date: "2026-01-15",
        completedTasks: 2,
        totalTasks: 5,
        tasks: [
          {
            taskId: "T1",
            label: "Tarea 1",
            status: "DONE",
            detail: "Hecho",
            late: null,
            optional: null,
          },
          {
            taskId: "T2",
            label: "Tarea 2",
            status: "EMPTY",
            detail: "Pendiente",
            late: true,
            optional: null,
          },
        ],
      },
    });
    expect(screen.getByText("2 de 5 tareas completadas")).toBeInTheDocument();
    expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    expect(screen.getByText("Tarea 2")).toBeInTheDocument();
    expect(screen.getByText("Tarde")).toBeInTheDocument();
  });

  it("renders DeliveryDetailContent for DELIVERY_NOT_RECEIVED with detail", () => {
    renderDrawer({
      alertType: "DELIVERY_NOT_RECEIVED",
      detailData: {
        today: "2026-01-15",
        isDeliveryDay: true,
        expectedDays: ["Lunes", "Miercoles"],
        eggExpectedDays: ["Martes"],
        recentBatches: [],
      },
    });
    expect(screen.getByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Miercoles")).toBeInTheDocument();
    expect(screen.getByText("Huevos:")).toBeInTheDocument();
    expect(screen.getByText("Martes")).toBeInTheDocument();
  });
});
