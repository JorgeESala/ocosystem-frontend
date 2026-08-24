import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PreviewStep } from "../components/PreviewStep";
import type { SalesImportPreviewDTO } from "../types";

vi.mock("../../product/api/categories.queries", () => ({
  useCategories: vi.fn(() => ({
    data: [
      { id: 1, name: "Pollo" },
      { id: 5, name: "Merma" },
    ],
    isLoading: false,
    isError: false,
  })),
}));

vi.mock("../../product/api/measurementUnits.queries", () => ({
  useMeasurementUnits: vi.fn(() => ({
    data: [{ id: 1, name: "Pieza" }],
    isLoading: false,
    isError: false,
  })),
}));

function basePreview(overrides: Partial<SalesImportPreviewDTO> = {}): SalesImportPreviewDTO {
  return {
    previewId: 1,
    branchId: 2,
    totalAmount: 100,
    totalTickets: 3,
    files: [
      {
        fileName: "reporte.xlsx",
        date: "2026-06-09",
        ticketCount: 3,
        totalAmount: 100,
      },
    ],
    newProducts: [],
    missingCategories: [],
    ...overrides,
  };
}

describe("PreviewStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows warning banner when missing categories", () => {
    render(
      <PreviewStep
        data={basePreview({ missingCategories: ["merma", "matados"] })}
        onBack={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Reporte sin categorías obligatorias/i),
    ).toBeInTheDocument();
  });

  it("opens confirmation modal and requires explicit confirmation", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <PreviewStep
        data={basePreview({ missingCategories: ["merma"] })}
        onBack={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Confirmar e insertar/i }));

    await waitFor(() => {
      expect(screen.getByText(/¿Deseas guardarlo de todos modos?/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirms with confirmedMissingCategories when manager saves anyway", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <PreviewStep
        data={basePreview({ missingCategories: ["merma"] })}
        onBack={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Confirmar e insertar/i }));

    await waitFor(() => {
      expect(screen.getByText(/¿Deseas guardarlo de todos modos?/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Guardar de todos modos/i }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ confirmedMissingCategories: true }),
      );
    });
  });

  it("confirms immediately when no missing categories", () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <PreviewStep
        data={basePreview()}
        onBack={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Confirmar e insertar/i }));

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ confirmedMissingCategories: false }),
    );
  });

  it("requires category for new products", () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <PreviewStep
        data={basePreview({
          newProducts: [
            {
              barcode: "N1",
              suggestedName: "Nuevo",
              suggestedCategoryId: null,
              suggestedUnitId: 1,
              totalQuantity: 2,
              totalAmount: 20,
            },
          ],
        })}
        onBack={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    const confirmButton = screen.getByRole("button", {
      name: /Confirmar e insertar/i,
    }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
  });
});