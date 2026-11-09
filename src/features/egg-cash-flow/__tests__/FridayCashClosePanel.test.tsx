import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FridayCashClosePanel from "../components/FridayCashClosePanel";
import type {
  TripSettlement,
  WeeklyClosePreview,
} from "../types/eggCashFlow.types";

const settlement = (
  overrides: Partial<TripSettlement> = {},
): TripSettlement => ({
  tripId: 1,
  departureDate: "2026-11-06",
  driverId: 1,
  driverName: "Chofer Uno",
  routeId: 1,
  routeName: "Ruta Uno",
  total: 4000,
  bankPosted: 0,
  officePosted: 0,
  officeAmount: 0,
  pending: 4000,
  status: "PENDING",
  editable: true,
  weekClosed: false,
  ...overrides,
});

const preview = (
  overrides: Partial<WeeklyClosePreview> = {},
): WeeklyClosePreview => ({
  settlementId: null,
  from: "2026-10-31",
  to: "2026-11-06",
  selectedTripId: 1,
  selectedTripDate: "2026-11-06",
  selectedTripDriverName: "Chofer Uno",
  selectedTripRouteName: "Ruta Uno",
  selectedTripTotal: 4000,
  selectedTripOfficePosted: 0,
  routeCashTotal: 6000,
  targetOfficeCash: 1000,
  currentOfficeCash: 300,
  baseOfficeCash: 300,
  requiredRetention: 700,
  retainedAmount: 700,
  shortfall: 0,
  priorExcessDeposit: 0,
  projectedOfficeCash: 1000,
  payrollTotal: 2500,
  hasPayroll: true,
  recorded: false,
  depositTransferGroup: null,
  ...overrides,
});

const renderPanel = (
  options: {
    previewData?: WeeklyClosePreview;
    settlements?: TripSettlement[];
    selectedTripId?: number | null;
    onSelectTrip?: (tripId: number | null) => void;
    onConfirm?: () => void;
  } = {},
) =>
  render(
    <FridayCashClosePanel
      preview={options.previewData ?? preview()}
      settlements={options.settlements ?? [settlement()]}
      selectedTripId={
        options.selectedTripId === undefined ? 1 : options.selectedTripId
      }
      onSelectTrip={options.onSelectTrip ?? vi.fn()}
      onConfirm={options.onConfirm ?? vi.fn()}
      isConfirming={false}
      isLoading={false}
      accountHolder="Enrique"
    />,
  );

describe("FridayCashClosePanel", () => {
  it("shows the target, payroll and resulting office cash", () => {
    renderPanel();

    expect(
      screen.getByText("Cierre de efectivo del viernes"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nómina registrada")).toBeInTheDocument();
    expect(screen.getByText("Efectivo objetivo en oficina")).toBeInTheDocument();
    expect(screen.getByText("Queda en oficina")).toBeInTheDocument();
    expect(screen.queryByText(/No hay nómina registrada/)).not.toBeInTheDocument();
  });

  it("warns when payroll is missing but still allows closing", () => {
    renderPanel({
      previewData: preview({ hasPayroll: false, payrollTotal: 0 }),
    });

    expect(
      screen.getByText(/No hay nómina registrada en este periodo/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cerrar viernes" }),
    ).toBeEnabled();
  });

  it("warns when the selected trip does not reach the target", () => {
    renderPanel({
      previewData: preview({
        requiredRetention: 1500,
        retainedAmount: 1000,
        shortfall: 500,
        selectedTripTotal: 1000,
      }),
    });

    expect(
      screen.getByText(/El despacho elegido no alcanza/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("$500.00").length).toBeGreaterThan(0);
  });

  it("maps the placeholder selection to null", () => {
    const onSelectTrip = vi.fn();
    renderPanel({ onSelectTrip });

    fireEvent.change(screen.getByLabelText("Despacho que conserva efectivo"), {
      target: { value: "" },
    });

    expect(onSelectTrip).toHaveBeenCalledWith(null);
  });

  it("does not list closed or non-editable trips", () => {
    renderPanel({
      settlements: [
        settlement({ tripId: 1, driverName: "Chofer Abierto" }),
        settlement({
          tripId: 2,
          driverName: "Chofer Cerrado",
          editable: false,
          weekClosed: true,
        }),
      ],
    });

    expect(
      screen.getByRole("option", { name: /Chofer Abierto/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /Chofer Cerrado/ }),
    ).not.toBeInTheDocument();
  });

  it("shows a message when there are no editable trips", () => {
    renderPanel({
      settlements: [
        settlement({
          tripId: 2,
          driverName: "Chofer Cerrado",
          editable: false,
          weekClosed: true,
        }),
      ],
    });

    expect(
      screen.getByText(/No hay despachos editables en este periodo/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cerrar viernes" }),
    ).not.toBeInTheDocument();
  });

  it("selects a trip and confirms the close", () => {
    const onSelectTrip = vi.fn();
    const onConfirm = vi.fn();
    renderPanel({ onSelectTrip, onConfirm });

    fireEvent.change(screen.getByLabelText("Despacho que conserva efectivo"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cerrar viernes" }));

    expect(onSelectTrip).toHaveBeenCalledWith(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("explains that an existing close will be recalculated", () => {
    renderPanel({ previewData: preview({ recorded: true }) });

    expect(screen.getByText("Registrado")).toBeInTheDocument();
    expect(
      screen.getByText(/Este viernes ya tiene un cierre registrado/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Recalcular cierre" }),
    ).toBeInTheDocument();
  });
});
