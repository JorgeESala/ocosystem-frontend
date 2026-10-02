import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AttentionQueue from "../components/AttentionQueue";
import type { AttentionItem } from "../utils/attention";

const renderQueue = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

const item = (overrides: Partial<AttentionItem> = {}): AttentionItem => ({
  id: "MISSING_REPORT-1",
  kind: "MISSING_REPORT",
  severity: "critical",
  branchId: 1,
  branchName: "Norte",
  title: "Sin reporte de ventas",
  detail: "0 de 7 días con reporte",
  to: "/business/sucursales/upload-reports",
  ...overrides,
});

describe("AttentionQueue", () => {
  it("renders items with branch, detail and action link", () => {
    renderQueue(
      <AttentionQueue
        items={[
          item(),
          item({
            id: "MISSING_REPORT-2",
            kind: "MISSING_REPORT",
            severity: "warning",
            branchId: 2,
            branchName: "Sur",
            title: "Cobertura parcial de reportes",
            detail: "3 de 7 días con reporte",
            to: "/business/sucursales/upload-reports",
          }),
        ]}
      />,
    );

    expect(screen.getByText("Norte")).toBeTruthy();
    expect(screen.getByText("Sin reporte de ventas")).toBeTruthy();
    expect(screen.getByText("0 de 7 días con reporte")).toBeTruthy();
    expect(screen.getByText("Sur")).toBeTruthy();

    const links = screen.getAllByRole("link", { name: /Atender/ });
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute("href")).toBe(
      "/business/sucursales/upload-reports",
    );
  });

  it("shows an empty state when there is nothing to attend", () => {
    renderQueue(<AttentionQueue items={[]} />);

    expect(screen.getByText(/Sin pendientes por atender/)).toBeTruthy();
  });

  it("shows the first five items and opens the rest in a drawer", () => {
    const many = ["Una", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete"].map(
      (branchName, index) =>
        item({ id: `item-${index}`, branchName, title: `Tarea ${index}` }),
    );
    renderQueue(<AttentionQueue items={many} />);

    expect(screen.getByText("Cinco")).toBeTruthy();
    expect(screen.queryByText("Seis")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Ver todas (2)" }));

    expect(screen.getByText("Seis")).toBeTruthy();
    expect(screen.getByText("Siete")).toBeTruthy();
    expect(screen.getAllByText("Una")).toHaveLength(2);
  });

  it("groups identical items into one row without branch names", () => {
    const many = ["Norte", "Sur", "Centro"].map((branchName, index) =>
      item({ id: `item-${index}`, branchName }),
    );
    renderQueue(<AttentionQueue items={many} />);

    expect(screen.getByText(/3 sucursales/)).toBeTruthy();
    expect(screen.queryByText("Norte")).toBeNull();
    expect(
      screen.getByRole("link", { name: /Atender/ }).getAttribute("href"),
    ).toBe("/business/sucursales/upload-reports");
    expect(screen.queryByRole("button", { name: /Ver todas/ })).toBeNull();
  });

  it("expands a grouped row to per-branch rows in the drawer", () => {
    const grouped = ["Norte", "Sur", "Centro"].map((branchName, index) =>
      item({ id: `g-${index}`, branchName }),
    );
    const singles = ["A", "B", "C", "D", "E"].map((branchName, index) =>
      item({ id: `s-${index}`, branchName, title: `Tarea ${index}` }),
    );
    renderQueue(<AttentionQueue items={[...grouped, ...singles]} />);

    expect(screen.queryByText("Norte")).toBeNull();
    expect(screen.queryByText("E")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Ver todas (1)" }));
    fireEvent.click(screen.getByRole("button", { name: "Ver 3 sucursales" }));

    expect(screen.getByText("Norte")).toBeTruthy();
    expect(screen.getByText("E")).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: /Atender/ }).length,
    ).toBeGreaterThan(0);
  });

  it("shows how many critical items exist", () => {
    const many = ["Una", "Dos", "Tres"].map((branchName, index) =>
      item({
        id: `item-${index}`,
        branchName,
        severity: index < 2 ? "critical" : "warning",
      }),
    );
    renderQueue(<AttentionQueue items={many} />);

    expect(screen.getByText("2 críticas")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Ver todas/ })).toBeNull();
  });

  it("shows a retry action on error", () => {
    const onRetry = vi.fn();
    renderQueue(<AttentionQueue items={[]} isError onRetry={onRetry} />);

    expect(screen.getByText(/No se pudieron cargar las alertas/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows a loading message", () => {
    renderQueue(<AttentionQueue items={[]} isLoading />);

    expect(screen.getByText(/Cargando pendientes/)).toBeTruthy();
  });
});
