import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChecklistDetailContent } from "../components/ChecklistDetailContent";

const baseDetail = {
  date: "2026-01-15",
  completedTasks: 3,
  totalTasks: 5,
  tasks: [
    {
      taskId: "T1",
      label: "Subir reporte",
      status: "DONE",
      detail: "Cargado a las 14:30",
      late: null,
      optional: null,
    },
    {
      taskId: "T2",
      label: "Verificar inventario",
      status: "EMPTY",
      detail: "Pendiente",
      late: true,
      optional: null,
    },
    {
      taskId: "T3",
      label: "Llamar proveedor",
      status: "NOT_APPLICABLE",
      detail: "No aplica hoy",
      late: null,
      optional: true,
    },
  ],
};

describe("ChecklistDetailContent", () => {
  it("renders progress summary", () => {
    render(<ChecklistDetailContent detail={baseDetail} />);
    expect(screen.getByText("3 de 5 tareas completadas")).toBeInTheDocument();
  });

  it("renders progress bar with correct width", () => {
    const { container } = render(
      <ChecklistDetailContent detail={baseDetail} />,
    );
    const bar = container.querySelector(".bg-green-500");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveStyle({ width: "60%" });
  });

  it("renders task labels", () => {
    render(<ChecklistDetailContent detail={baseDetail} />);
    expect(screen.getByText("Subir reporte")).toBeInTheDocument();
    expect(screen.getByText("Verificar inventario")).toBeInTheDocument();
    expect(screen.getByText("Llamar proveedor")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    render(<ChecklistDetailContent detail={baseDetail} />);
    expect(screen.getByText("Completado")).toBeInTheDocument();
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("No aplica")).toBeInTheDocument();
  });

  it("renders late badge when task is late", () => {
    render(<ChecklistDetailContent detail={baseDetail} />);
    expect(screen.getByText("Tarde")).toBeInTheDocument();
  });

  it("renders optional badge when task is optional", () => {
    render(<ChecklistDetailContent detail={baseDetail} />);
    expect(screen.getByText("Opcional")).toBeInTheDocument();
  });

  it("renders task details", () => {
    render(<ChecklistDetailContent detail={baseDetail} />);
    expect(screen.getByText("Cargado a las 14:30")).toBeInTheDocument();
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("No aplica hoy")).toBeInTheDocument();
  });

  it("renders 0% width when totalTasks is 0", () => {
    const detail = {
      ...baseDetail,
      completedTasks: 0,
      totalTasks: 0,
      tasks: [],
    };
    const { container } = render(<ChecklistDetailContent detail={detail} />);
    const bar = container.querySelector(".bg-green-500");
    expect(bar).toHaveStyle({ width: "0%" });
  });
});
