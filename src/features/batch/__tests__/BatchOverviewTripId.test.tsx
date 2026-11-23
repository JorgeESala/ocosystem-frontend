import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { BatchResponseDTO } from "../types.batch";
import { ChickenBatchOverview } from "../components/live-chicken/ChickenBatchOverview";
import { EggBatchOverview } from "../components/egg/EggBatchOverview";

const baseMock = vi.hoisted(() => vi.fn());

vi.mock("../components/BaseBatchOverview", async () => {
  const React = await import("react");
  return {
    BaseBatchOverview: (props: { tripId?: number | null }) => {
      baseMock(props);
      return React.createElement("div", {
        "data-testid": "base-overview",
        "data-trip-id": props.tripId ?? "",
      });
    },
  };
});

const batch: BatchResponseDTO = {
  id: 130,
  supplierId: 1,
  supplierName: "Proveedor",
  cedisId: 1,
  cedisName: "CEDIS",
  entryDate: "2026-11-19",
  totalAmount: "1000",
  type: "LIVE_CHICKEN",
  metadata: {},
  initialQuantity: "100",
  soldQuantity: "100",
  adjustedQuantity: "0",
  remainingQuantity: "0",
  remainingBoxes: 0,
  remainingCartons: 0,
  remainingPieces: 0,
};

describe("resumen de remesa con viaje", () => {
  it("pasa el viaje a la tabla de pollo vivo", () => {
    render(<ChickenBatchOverview batch={batch} tripId={77} />);

    expect(screen.getByTestId("base-overview")).toHaveAttribute(
      "data-trip-id",
      "77",
    );
  });

  it("pasa el viaje a la tabla de huevo", () => {
    render(<EggBatchOverview batch={{ ...batch, type: "EGG" }} tripId={219} />);

    expect(screen.getByTestId("base-overview")).toHaveAttribute(
      "data-trip-id",
      "219",
    );
    expect(baseMock).toHaveBeenCalledWith(
      expect.objectContaining({ tripId: 219 }),
    );
  });
});
