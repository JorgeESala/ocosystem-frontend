import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UnitCashCutList from "../components/UnitCashCutList";

const mocks = vi.hoisted(() => ({
  useUnitCashCuts: vi.fn(),
}));

vi.mock("../api/unitCash.queries", () => ({
  useUnitCashCuts: mocks.useUnitCashCuts,
}));

vi.mock("@/features/employee/api/employees.queries", () => ({
  useEmployees: vi.fn(() => ({
    data: [
      { id: 3, name: "Ana" },
      { id: 4, name: "Luis" },
    ],
  })),
}));

describe("UnitCashCutList", () => {
  it("shows the cut with closing/opening and responsibles", () => {
    mocks.useUnitCashCuts.mockReturnValue({
      data: [
        {
          id: 1,
          cutDate: "2026-09-20",
          closingBalance: 1500,
          openingBalance: 0,
          alertThreshold: 50,
          note: "Entrega a nuevo responsable",
          handedOverBy: 3,
          receivedBy: 4,
          createdBy: 3,
          createdAt: "2026-09-20T10:00:00",
        },
      ],
    });

    render(
      <UnitCashCutList
        unit="EGG"
        startDate={new Date()}
        endDate={new Date()}
      />,
    );

    expect(
      screen.getByText(/Cierre \$1,500\.00 → Apertura \$0\.00/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Entregó: Ana · Recibió: Luis/),
    ).toBeInTheDocument();
    expect(screen.getByText("Entrega a nuevo responsable")).toBeInTheDocument();
  });

  it("renders nothing without cuts", () => {
    mocks.useUnitCashCuts.mockReturnValue({ data: [] });

    const { container } = render(
      <UnitCashCutList
        unit="EGG"
        startDate={new Date()}
        endDate={new Date()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
