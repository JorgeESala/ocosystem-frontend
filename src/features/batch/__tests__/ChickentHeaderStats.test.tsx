import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChickenHeaderStats } from "../components/live-chicken/ChickentHeaderStats";
import type { BatchResponseDTO } from "../types.batch";

const batch = (
  overrides: Partial<BatchResponseDTO> = {},
): BatchResponseDTO => ({
  id: 1,
  supplierId: 1,
  supplierName: "Proveedor",
  cedisId: 1,
  cedisName: "CEDIS",
  entryDate: "2030-01-07",
  totalAmount: "1000",
  type: "LIVE_CHICKEN",
  metadata: {},
  initialQuantity: "100",
  soldQuantity: "0",
  adjustedQuantity: "0",
  remainingQuantity: "100",
  remainingBoxes: 0,
  remainingCartons: 0,
  remainingPieces: 0,
  weightReal: "215",
  ...overrides,
});

describe("ChickentHeaderStats", () => {
  it("muestra el peso promedio por ave de la remesa", () => {
    render(<ChickenHeaderStats batch={batch()} />);

    expect(screen.getByText("Peso Promedio")).toBeInTheDocument();
    expect(screen.getByText("2.15 kg")).toBeInTheDocument();
  });

  it("muestra un guion cuando no hay peso o aves", () => {
    render(
      <ChickenHeaderStats
        batch={batch({ initialQuantity: "0", weightReal: "0" })}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
