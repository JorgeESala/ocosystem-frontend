import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TripSettlementsPanel from "../components/TripSettlementsPanel";
import type { TripSettlement } from "../types/eggCashFlow.types";

const settlement = (
  overrides: Partial<TripSettlement> = {},
): TripSettlement => ({
  tripId: 1,
  departureDate: "2026-10-05",
  driverId: 1,
  driverName: "Chofer Uno",
  routeId: 1,
  routeName: "Ruta Uno",
  total: 1000,
  bankPosted: 0,
  officePosted: 0,
  officeAmount: 0,
  pending: 1000,
  status: "PENDING",
  editable: true,
  weekClosed: false,
  ...overrides,
});

const renderPanel = (
  settlements: TripSettlement[],
  onConfirm = vi.fn(),
  isConfirming = false,
) =>
  render(
    <TripSettlementsPanel
      settlements={settlements}
      onConfirm={onConfirm}
      isConfirming={isConfirming}
    />,
  );

describe("TripSettlementsPanel", () => {
  it("shows the total and defaults the office amount to zero", () => {
    renderPanel([settlement()]);

    expect(screen.getByText("Cobranza de ruta")).toBeInTheDocument();
    expect(screen.getByText(/Total cobrado/)).toBeInTheDocument();
    expect(screen.getAllByLabelText("Se quedó en oficina")[0]).toHaveValue(0);
    expect(
      screen.getByRole("button", { name: /Confirmar todos \(1\)/ }),
    ).toBeInTheDocument();
  });

  it("confirms a trip with the edited office amount", () => {
    const onConfirm = vi.fn();
    renderPanel([settlement()], onConfirm);

    fireEvent.change(screen.getByLabelText("Se quedó en oficina"), {
      target: { value: "400" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onConfirm).toHaveBeenCalledWith([{ tripId: 1, officeAmount: 400 }]);
  });

  it("can send the whole trip to the office", () => {
    const onConfirm = vi.fn();
    renderPanel([settlement()], onConfirm);

    fireEvent.click(screen.getByRole("button", { name: "Todo" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onConfirm).toHaveBeenCalledWith([{ tripId: 1, officeAmount: 1000 }]);
  });

  it("only includes pending or changed trips in confirm all", () => {
    const onConfirm = vi.fn();
    renderPanel(
      [
        settlement({ tripId: 1, status: "CONFIRMED", officeAmount: 100 }),
        settlement({ tripId: 2, driverName: "Chofer Dos" }),
      ],
      onConfirm,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar todos \(1\)/ }),
    );

    expect(onConfirm).toHaveBeenCalledWith([{ tripId: 2, officeAmount: 0 }]);
  });

  it("does not allow editing a closed week", () => {
    renderPanel([
      settlement({
        status: "CLOSED",
        editable: false,
        weekClosed: true,
      }),
    ]);

    expect(screen.getByText(/La semana ya está cerrada/)).toBeInTheDocument();
    expect(screen.getByLabelText("Se quedó en oficina")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /Confirmar todos/ }),
    ).not.toBeInTheDocument();
  });
});
