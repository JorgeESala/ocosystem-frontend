import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BatchPage } from "../pages/BatchPage";

const batch = {
  id: 130,
  supplierId: 1,
  supplierName: "Proveedor",
  cedisId: 1,
  cedisName: "CEDIS",
  entryDate: "2026-11-19",
  totalAmount: "1000",
  type: "LIVE_CHICKEN" as const,
  metadata: {},
  initialQuantity: "100",
  soldQuantity: "100",
  adjustedQuantity: "0",
  remainingQuantity: "0",
  remainingBoxes: 0,
  remainingCartons: 0,
  remainingPieces: 0,
};

vi.mock("../api/batch.queries", () => ({
  useBatches: () => ({
    data: [batch],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("../config/unitConfig", () => ({
  UNIT_CONFIG: {
    LIVE_CHICKEN: {
      label: "Pollo vivo",
      description: "Pollo vivo",
      overviewComponent: () => <div>Tarjeta de remesa</div>,
    },
  },
}));

vi.mock("../components/GlobalAvailabilitySummary", () => ({
  GlobalAvailabilitySummary: () => <div>Disponibilidad</div>,
}));

vi.mock("../components/WeeklySalesChart", () => ({
  WeeklySalesChart: () => <div>Ventas semanales</div>,
}));

vi.mock("../components/SalesByClientChart", () => ({
  SalesByClientChart: () => <div>Ventas por cliente</div>,
}));

vi.mock("../components/BatchEntryForm", () => ({
  BatchEntryForm: () => <div>Nueva remesa</div>,
}));

describe("BatchPage - acceso a un viaje", () => {
  it("muestra las remesas sin existencia al abrir un viaje", async () => {
    render(
      <MemoryRouter
        initialEntries={["/business/pollo-vivo/salesAndBatches?tripId=76"]}
      >
        <BatchPage unitType="LIVE_CHICKEN" />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Tarjeta de remesa")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: "Solo con disponibilidad" }),
      ).not.toBeChecked(),
    );
  });

  it("muestra la remesa indicada aunque no tenga existencia", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/business/pollo-vivo/salesAndBatches?batch=130",
        ]}
      >
        <BatchPage unitType="LIVE_CHICKEN" />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Tarjeta de remesa")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: "Solo con disponibilidad" }),
      ).not.toBeChecked(),
    );
  });
});
