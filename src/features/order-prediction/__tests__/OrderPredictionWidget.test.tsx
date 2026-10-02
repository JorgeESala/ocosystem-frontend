import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrderPredictionWidget from "../components/OrderPredictionWidget";
import type { OrderPredictionDTO, PredictionPeriodDTO } from "../types";

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: {
    data: [] as OrderPredictionDTO[],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}));

vi.mock("../api/orderPrediction.queries", () => ({
  useOrderPredictions: () => mockQuery,
}));

const period = (
  overrides: Partial<PredictionPeriodDTO> = {},
): PredictionPeriodDTO => ({
  deliveryDay: "Lunes",
  deliveryDate: "2026-10-05",
  endDate: "2026-10-11",
  chicken: 0,
  eggs: 0,
  interpolated: false,
  dailyBreakdown: [],
  ...overrides,
});

const prediction = (
  overrides: Partial<OrderPredictionDTO> = {},
): OrderPredictionDTO => ({
  branchId: 1,
  branchName: "Norte",
  deliveryDays: [1],
  eggDeliveryDays: [],
  chickenPeriods: [],
  eggPeriods: [],
  totalChicken: 0,
  totalEggs: 0,
  ...overrides,
});

const renderWidget = () =>
  render(
    <MemoryRouter>
      <OrderPredictionWidget />
    </MemoryRouter>,
  );

describe("OrderPredictionWidget", () => {
  beforeEach(() => {
    mockQuery.data = [];
    mockQuery.isLoading = false;
    mockQuery.isError = false;
    mockQuery.refetch.mockClear();
  });

  it("shows weekly totals and the next deliveries", () => {
    mockQuery.data = [
      prediction({
        totalChicken: 120,
        totalEggs: 40,
        chickenPeriods: [period({ deliveryDate: "2026-10-05", chicken: 120 })],
        eggPeriods: [period({ deliveryDate: "2026-10-05", eggs: 40 })],
      }),
      prediction({
        branchId: 2,
        branchName: "Sur",
        totalChicken: 80,
        chickenPeriods: [
          period({
            deliveryDay: "Jueves",
            deliveryDate: "2026-10-08",
            chicken: 80,
          }),
        ],
      }),
    ];

    renderWidget();

    expect(screen.getByText(/200 pollos/)).toBeTruthy();
    expect(screen.getByText(/40 casilleros/)).toBeTruthy();
    expect(screen.getByText("Norte")).toBeTruthy();
    expect(screen.getByText("Sur")).toBeTruthy();
  });

  it("opens the full breakdown in a drawer without duplicating the preview", () => {
    mockQuery.data = [
      prediction({
        branchId: 1,
        branchName: "Una",
        totalChicken: 10,
        chickenPeriods: [period({ deliveryDate: "2026-10-05", chicken: 10 })],
      }),
      prediction({
        branchId: 2,
        branchName: "Dos",
        totalChicken: 20,
        chickenPeriods: [
          period({
            deliveryDay: "Jueves",
            deliveryDate: "2026-10-08",
            chicken: 20,
          }),
        ],
      }),
      prediction({
        branchId: 3,
        branchName: "Tres",
        totalChicken: 30,
        chickenPeriods: [
          period({
            deliveryDay: "Sábado",
            deliveryDate: "2026-10-10",
            chicken: 30,
          }),
        ],
      }),
      prediction({
        branchId: 4,
        branchName: "Cuatro",
        totalChicken: 40,
        chickenPeriods: [
          period({
            deliveryDay: "Domingo",
            deliveryDate: "2026-10-11",
            chicken: 40,
          }),
        ],
      }),
    ];

    renderWidget();

    expect(screen.queryByText("Cuatro")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /Ver todas las predicciones/ }),
    );

    expect(screen.getByText("Cuatro")).toBeTruthy();
    expect(screen.getAllByText("Una")).toHaveLength(2);
  });

  it("shows an empty state without delivery schedules", () => {
    mockQuery.data = [];

    renderWidget();

    expect(
      screen.getByText(/No hay calendarios de entrega configurados/),
    ).toBeTruthy();
  });

  it("shows an error state with retry", () => {
    mockQuery.isError = true;

    renderWidget();

    expect(
      screen.getByText(/No se pudieron cargar las predicciones/),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(mockQuery.refetch).toHaveBeenCalledTimes(1);
  });

  it("shows a loading state", () => {
    mockQuery.isLoading = true;

    const { container } = renderWidget();

    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });
});
