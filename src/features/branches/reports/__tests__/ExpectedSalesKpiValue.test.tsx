import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ExpectedSalesSummaryDTO } from "../api/expectedSales.api";
import { ExpectedSalesKpiValue } from "../components/ExpectedSalesKpiValue";

const summary: ExpectedSalesSummaryDTO = {
  expectedKg: 1000,
  reportedKg: 1050,
  differenceKg: 50,
  variancePct: 5,
  birdsSold: 600,
  avgChickenWeight: 1.9,
  salesCount: 3,
  salesWithoutWeight: 0,
  salesWithoutReportedKg: 0,
  daysWithData: 1,
  wastePerChickenKg: 0.25,
  reportedMoney: 45000,
  comparableReportedMoney: 45000,
  expectedMoney: 45000,
  moneyDifference: 0,
  effectivePricePerKg: 45,
  daysWithoutPrice: 0,
  comparableDays: 1,
  branchesWithoutReference: 0,
  salesWithZeroMoney: 0,
  salesWithoutReportedMoney: 0,
  daysWithoutReportedMoney: 0,
};

const openTooltip = () => {
  fireEvent.mouseEnter(
    screen.getByLabelText(/Ver cálculo de la venta esperada/),
  );
};

describe("ExpectedSalesKpiValue", () => {
  it("labels the KPI minimum as the total", () => {
    render(<ExpectedSalesKpiValue summary={summary} branchName="Centro" />);

    openTooltip();

    expect(screen.getByText("Centro")).toBeTruthy();
    expect(screen.getByText(/Mínimo total: \$45,000\.00/)).toBeTruthy();
    expect(
      screen.getByText(
        "Suma de kg esperados × precio de cada día con precio de referencia; incluye días sin monto registrado.",
      ),
    ).toBeTruthy();
  });

  it("shows partial price and amount warnings", () => {
    render(
      <ExpectedSalesKpiValue
        summary={{
          ...summary,
          daysWithoutPrice: 1,
          salesWithoutReportedMoney: 1,
        }}
      />,
    );

    openTooltip();

    expect(
      screen.getByText("Falta precio de referencia en uno o más días."),
    ).toBeTruthy();
    expect(
      screen.getByText("Falta monto registrado en una o más ventas."),
    ).toBeTruthy();
  });
});
