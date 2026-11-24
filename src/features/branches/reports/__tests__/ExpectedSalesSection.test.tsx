import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MockResponsiveContainer } from "@/test/rechartsMock";
import type { ExpectedSalesReportDTO } from "../api/expectedSales.api";
import { ExpectedSalesSection } from "../components/ExpectedSalesSection";

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: MockResponsiveContainer,
}));

vi.mock("../components/ReferenceProductModal", () => ({
  ReferenceProductModal: ({ onClose }: { onClose: () => void }) => (
    <div>
      <p>Producto de referencia por sucursal</p>
      <button onClick={onClose}>Cerrar modal</button>
    </div>
  ),
}));

const report: ExpectedSalesReportDTO = {
  summary: {
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
    expectedMoney: 45000,
    reportedMoney: 46000,
    moneyDifference: 1000,
    daysWithoutPrice: 0,
    branchesWithoutReference: 0,
  },
  branches: [
    {
      branchId: 1,
      branchName: "Centro",
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
      referenceProductBarcode: "REF",
      referenceProductName: "Pollo entero",
      referencePricePerKg: 45,
      priceAsOf: "2026-06-01",
      expectedMoney: 45000,
      reportedMoney: 46000,
      moneyDifference: 1000,
      priceMissingDays: 0,
    },
  ],
  daily: [
    {
      branchId: 1,
      branchName: "Centro",
      day: "2026-06-01",
      expectedKg: 1000,
      reportedKg: 1050,
      differenceKg: 50,
      variancePct: 5,
      birdsSold: 600,
      avgChickenWeight: 1.9,
      salesCount: 3,
      salesWithoutWeight: 0,
      salesWithoutReportedKg: 0,
      referencePricePerKg: 45,
      priceAsOf: "2026-06-01",
      expectedMoney: 45000,
      reportedMoney: 46000,
      moneyDifference: 1000,
    },
  ],
};

describe("ExpectedSalesSection", () => {
  it("renders the expected, reported and difference totals", () => {
    render(<ExpectedSalesSection data={report} />);

    expect(
      screen.getByRole("heading", { name: /Venta esperada vs vendida/ }),
    ).toBeTruthy();
    expect(screen.getByText("1,000 kg")).toBeTruthy();
    expect(screen.getByText("1,050 kg")).toBeTruthy();
    expect(screen.getByText("50 kg")).toBeTruthy();
    expect(screen.getAllByText("+5.0%").length).toBeGreaterThan(0);
    expect(screen.getByText("600 pollos vendidos")).toBeTruthy();
  });

  it("switches to the money view with the minimum and registered money", () => {
    render(<ExpectedSalesSection data={report} />);

    fireEvent.click(screen.getByText("Dinero"));

    expect(screen.getByText("Venta mínima esperada")).toBeTruthy();
    expect(screen.getAllByText("Venta registrada").length).toBeGreaterThan(0);
    expect(screen.getByText("Diferencia contra el mínimo")).toBeTruthy();
    expect(screen.getAllByText("$45,000.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$46,000.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$1,000.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$45.00 / kg").length).toBeGreaterThan(0);
  });

  it("switches back to the kg view", () => {
    render(<ExpectedSalesSection data={report} />);

    fireEvent.click(screen.getByText("Dinero"));
    fireEvent.click(screen.getByText("Kg"));

    expect(screen.getAllByText("Kg esperados").length).toBeGreaterThan(0);
    expect(screen.getByText("1,000 kg")).toBeTruthy();
  });

  it("warns about branches without a reference product and days without price", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: {
            ...report.summary,
            branchesWithoutReference: 2,
            daysWithoutPrice: 1,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Dinero"));

    expect(
      screen.getByText(/2 sucursales no tienen producto de referencia/),
    ).toBeTruthy();
    expect(screen.getByText(/1 día sin precio de referencia/)).toBeTruthy();
  });

  it("uses the singular for one branch and the plural for several days", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: {
            ...report.summary,
            branchesWithoutReference: 1,
            daysWithoutPrice: 2,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Dinero"));

    expect(
      screen.getByText(/1 sucursal no tiene producto de referencia/),
    ).toBeTruthy();
    expect(screen.getByText(/2 días sin precio de referencia/)).toBeTruthy();
  });

  it("explains the consolidated reference price", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          daily: [
            report.daily[0],
            {
              ...report.daily[0],
              branchId: 2,
              branchName: "Norte",
            },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByText("Dinero"));

    expect(
      screen.getByText("Cada sucursal usa su propio producto de referencia"),
    ).toBeTruthy();
    expect(screen.getByText("Precio efectivo/kg")).toBeTruthy();
  });

  it("shows the below-minimum hint", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: {
            ...report.summary,
            expectedMoney: 1000,
            reportedMoney: 900,
            moneyDifference: -100,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Dinero"));

    expect(screen.getByText("Por debajo del mínimo")).toBeTruthy();
  });

  it("colors a daily row below the minimum", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          daily: [
            {
              ...report.daily[0],
              expectedMoney: 1000,
              reportedMoney: 900,
              moneyDifference: -100,
            },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByText("Dinero"));

    expect(screen.getAllByText("-$100.00").length).toBeGreaterThan(0);
  });

  it("shows a blank difference when the daily row has no price", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          daily: [
            {
              ...report.daily[0],
              referencePricePerKg: null,
              priceAsOf: null,
              expectedMoney: null,
              reportedMoney: null,
              moneyDifference: null,
            },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByText("Dinero"));

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("explains when money cannot be calculated", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: {
            ...report.summary,
            expectedMoney: null,
            reportedMoney: null,
            moneyDifference: null,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Dinero"));

    expect(
      screen.getByText("Sin producto o precio de referencia"),
    ).toBeTruthy();
  });

  it("opens the reference product picker from the report", () => {
    render(<ExpectedSalesSection data={report} asOf={new Date(2026, 5, 7)} />);

    fireEvent.click(screen.getByText("Producto de referencia"));

    expect(
      screen.getByText("Producto de referencia por sucursal"),
    ).toBeTruthy();

    fireEvent.click(screen.getByText("Cerrar modal"));

    expect(
      screen.queryByText("Producto de referencia por sucursal"),
    ).toBeNull();
  });

  it("warns about sales without a batch weight", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: { ...report.summary, salesWithoutWeight: 2 },
        }}
      />,
    );

    expect(
      screen.getByText(/2 ventas sin peso promedio de remesa/),
    ).toBeTruthy();
  });

  it("uses the singular warning for one sale without a batch weight", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: { ...report.summary, salesWithoutWeight: 1 },
        }}
      />,
    );

    expect(
      screen.getByText(/1 venta sin peso promedio de remesa no se incluye/),
    ).toBeTruthy();
  });

  it("warns about sales without reported kilos", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: { ...report.summary, salesWithoutReportedKg: 2 },
        }}
      />,
    );

    expect(
      screen.getByText(/2 ventas sin kilos vendidos registrados/),
    ).toBeTruthy();
  });

  it("uses the singular warning for one sale without reported kilos", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: { ...report.summary, salesWithoutReportedKg: 1 },
        }}
      />,
    );

    expect(
      screen.getByText(/1 venta sin kilos vendidos registrados no se incluye/),
    ).toBeTruthy();
  });

  it("shows an error with a retry action when the request fails", () => {
    const onRetry = vi.fn();
    render(<ExpectedSalesSection isError onRetry={onRetry} />);

    expect(
      screen.getByText(/No se pudo cargar la venta esperada/),
    ).toBeTruthy();
    fireEvent.click(screen.getByText("Reintentar"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows a loading message before the first load", () => {
    render(<ExpectedSalesSection isLoading />);

    expect(screen.getByText("Cargando venta esperada...")).toBeTruthy();
  });

  it("handles a missing report without crashing", () => {
    render(<ExpectedSalesSection />);

    expect(
      screen.getByText(
        "No hay ventas de remesa con peso promedio y kilos vendidos registrados en el periodo.",
      ),
    ).toBeTruthy();
  });

  it("notes when the daily rows combine several branches", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          daily: [
            report.daily[0],
            {
              ...report.daily[0],
              branchId: 2,
              branchName: "Norte",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByText(/Suma de las sucursales seleccionadas/),
    ).toBeTruthy();
  });

  it("explains when there is no expected sales data", () => {
    render(
      <ExpectedSalesSection
        data={{
          summary: {
            ...report.summary,
            expectedKg: null,
            reportedKg: null,
            differenceKg: null,
            variancePct: null,
            birdsSold: 0,
            avgChickenWeight: null,
            salesCount: 0,
            salesWithoutWeight: 1,
            salesWithoutReportedKg: 0,
            daysWithData: 0,
            expectedMoney: null,
            reportedMoney: null,
            moneyDifference: null,
          },
          branches: [],
          daily: [],
        }}
      />,
    );

    expect(
      screen.getByText(
        "No hay ventas de remesa con peso promedio y kilos vendidos registrados en el periodo.",
      ),
    ).toBeTruthy();
  });
});
