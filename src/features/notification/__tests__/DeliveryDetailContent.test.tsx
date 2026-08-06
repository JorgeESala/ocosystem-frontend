import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeliveryDetailContent } from "../components/DeliveryDetailContent";

const baseDetail = {
  today: "2026-01-15",
  isDeliveryDay: true,
  expectedDays: ["Lunes", "Miercoles", "Viernes"],
  eggExpectedDays: ["Martes", "Jueves"],
  recentBatches: [
    { batchId: 1, entryDate: "2026-01-13", chickenQuantity: 50, kgTotal: 100, provider: "Proveedor A" },
    { batchId: 2, entryDate: "2026-01-10", chickenQuantity: 30, kgTotal: 60, provider: null },
  ],
};

describe("DeliveryDetailContent", () => {
  it("renders today's date", () => {
    render(<DeliveryDetailContent detail={baseDetail} />);
    expect(screen.getByText("2026-01-15")).toBeInTheDocument();
  });

  it("shows delivery day badge when isDeliveryDay is true", () => {
    render(<DeliveryDetailContent detail={baseDetail} />);
    expect(screen.getByText(/a de entrega/)).toBeInTheDocument();
  });

  it("shows not-delivery-day badge when isDeliveryDay is false", () => {
    const detail = { ...baseDetail, isDeliveryDay: false };
    render(<DeliveryDetailContent detail={detail} />);
    expect(screen.getByText(/No es d/)).toBeInTheDocument();
  });

  it("renders expected delivery days", () => {
    render(<DeliveryDetailContent detail={baseDetail} />);
    expect(screen.getByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Miercoles")).toBeInTheDocument();
    expect(screen.getByText("Viernes")).toBeInTheDocument();
  });

  it("renders egg expected days", () => {
    render(<DeliveryDetailContent detail={baseDetail} />);
    expect(screen.getByText("Huevos:")).toBeInTheDocument();
    expect(screen.getByText("Martes")).toBeInTheDocument();
    expect(screen.getByText("Jueves")).toBeInTheDocument();
  });

  it("does not render egg section when empty", () => {
    const detail = { ...baseDetail, eggExpectedDays: [] };
    render(<DeliveryDetailContent detail={detail} />);
    expect(screen.queryByText("Huevos:")).not.toBeInTheDocument();
  });

  it("renders recent batches table", () => {
    render(<DeliveryDetailContent detail={baseDetail} />);
    expect(screen.getByText("Proveedor A")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("shows --- for null provider in batch", () => {
    const { container } = render(<DeliveryDetailContent detail={baseDetail} />);
    const cells = container.querySelectorAll("td");
    const dashCells = Array.from(cells).filter((c) => c.textContent?.includes("---") || c.textContent?.includes("\u2014"));
    expect(dashCells.length).toBeGreaterThanOrEqual(1);
  });

  it("shows sin remesas when no batches", () => {
    const detail = { ...baseDetail, recentBatches: [] };
    render(<DeliveryDetailContent detail={detail} />);
    expect(screen.getByText("Sin remesas registrados")).toBeInTheDocument();
  });

  it("shows sin programacion when no expected days", () => {
    const detail = { ...baseDetail, expectedDays: [] };
    render(<DeliveryDetailContent detail={detail} />);
    expect(screen.getByText(/Sin programaci/)).toBeInTheDocument();
  });
});
