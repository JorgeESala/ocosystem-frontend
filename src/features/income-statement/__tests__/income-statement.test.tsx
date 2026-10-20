import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StatementSection } from "../components/StatementSection";
import { CashBridgePanel } from "../components/CashBridgePanel";
import { RouteBreakdownTable } from "../components/RouteBreakdownTable";
import { IncomeStatementPage } from "../pages/IncomeStatementPage";
import type { IncomeStatement } from "../types/income-statement.types";

const mocks = vi.hoisted(() => ({
  useIncomeStatement: vi.fn(),
}));

vi.mock("../api/income-statement.queries", () => ({
  useIncomeStatement: mocks.useIncomeStatement,
}));

vi.mock("../api/income-statement.api", () => ({
  downloadIncomeStatementPdf: vi.fn(),
}));

const fixture = (
  overrides: Partial<IncomeStatement> = {},
): IncomeStatement => ({
  start: "2026-01-01",
  end: "2026-01-31",
  unitType: "EGG",
  ingresos: { ventasNetas: 1000, ventasContado: 400, ventasCredito: 600 },
  costoVentas: { costoRemesas: 500, alimento: 100, merma: 50, total: 650 },
  utilidadBruta: 350,
  gastosOperacion: {
    venta: {
      gastos: [
        { categoria: "FUEL", nombre: "Combustible", monto: 50, movimientos: 2 },
      ],
      total: 50,
    },
    administracion: {
      gastos: [
        { categoria: "RENT", nombre: "Renta", monto: 30, movimientos: 1 },
      ],
      total: 30,
    },
    total: 80,
  },
  utilidadOperativa: 270,
  utilidadNeta: 270,
  efectivo: {
    entradasVentasContado: 400,
    entradasCobros: 300,
    entradasOtros: 0,
    entradasTotal: 700,
    salidasGastos: 80,
    salidasPagosProveedores: 100,
    salidasOtros: 0,
    salidasTotal: 180,
    neto: 520,
  },
  puente: {
    ventasContado: 400,
    ventasCredito: 600,
    cobros: 300,
    efectivoEntrado: 700,
    variacionCartera: 300,
    cuadreDisponible: true,
    cuadreDiferencia: 0,
  },
  rutas: [
    {
      rutaId: 1,
      rutaNombre: "Ruta Norte",
      ventas: 700,
      costo: 300,
      combustible: 50,
      margen: 350,
    },
    {
      rutaId: null,
      rutaNombre: "Sin ruta",
      ventas: 300,
      costo: 200,
      combustible: 0,
      margen: 100,
    },
  ],
  ...overrides,
});

describe("StatementSection", () => {
  it("renders formal sections and subtotals", () => {
    render(<StatementSection data={fixture()} />);

    expect(screen.getByText("Estado de resultados")).toBeInTheDocument();
    expect(screen.getByText("Ventas de contado")).toBeInTheDocument();
    expect(screen.getByText("Ventas a crédito")).toBeInTheDocument();
    expect(screen.getByText("Ventas netas")).toBeInTheDocument();
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("Total costo de ventas")).toBeInTheDocument();
    expect(screen.getByText("UTILIDAD BRUTA")).toBeInTheDocument();
    expect(screen.getByText("Total gastos de operación")).toBeInTheDocument();
    expect(screen.getByText("Combustible")).toBeInTheDocument();
    expect(screen.getByText("Renta")).toBeInTheDocument();
    expect(screen.getByText("UTILIDAD OPERATIVA")).toBeInTheDocument();
    expect(screen.getByText("UTILIDAD NETA")).toBeInTheDocument();
    expect(screen.getAllByText("$270.00")).toHaveLength(2);
  });

  it("shows the empty placeholder when a gastos section has no items", () => {
    const data = fixture();
    data.gastosOperacion = {
      venta: { gastos: [], total: 0 },
      administracion: { gastos: [], total: 0 },
      total: 0,
    };
    render(<StatementSection data={data} />);

    expect(
      screen.getAllByText("Sin gastos registrados en el periodo"),
    ).toHaveLength(2);
  });
});

describe("CashBridgePanel", () => {
  it("renders the bridge and a clean cash reconciliation", () => {
    render(<CashBridgePanel puente={fixture().puente} />);

    expect(screen.getByText("De utilidad a efectivo")).toBeInTheDocument();
    expect(
      screen.getByText("Efectivo entrado por ventas y cobros"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Variación de cartera (crédito - cobros)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cuadre contra caja: sin diferencias"),
    ).toBeInTheDocument();
  });

  it("flags a difference against the cash ledger", () => {
    const puente = { ...fixture().puente, cuadreDiferencia: 12.5 };
    render(<CashBridgePanel puente={puente} />);

    expect(screen.getByText("Diferencia contra caja")).toBeInTheDocument();
    expect(screen.getByText("$12.50")).toBeInTheDocument();
  });

  it("hides the reconciliation when the period is outside the tracking window", () => {
    const puente = {
      ...fixture().puente,
      cuadreDisponible: false,
      cuadreDiferencia: null,
    };
    render(<CashBridgePanel puente={puente} />);

    expect(screen.queryByText(/Cuadre contra caja/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Diferencia contra caja/),
    ).not.toBeInTheDocument();
  });
});

describe("RouteBreakdownTable", () => {
  it("renders route rows with margin percentage", () => {
    render(<RouteBreakdownTable rutas={fixture().rutas} />);

    expect(screen.getByText("Ventas y costo por ruta")).toBeInTheDocument();
    expect(screen.getByText("Ruta Norte")).toBeInTheDocument();
    expect(screen.getByText("Sin ruta")).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();
  });

  it("renders nothing without routes", () => {
    const { container } = render(<RouteBreakdownTable rutas={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("IncomeStatementPage", () => {
  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/business/huevo/income-statement"]}>
        <Routes>
          <Route
            path="/business/huevo/income-statement"
            element={<IncomeStatementPage unitType="EGG" />}
          />
        </Routes>
      </MemoryRouter>,
    );

  it("renders header and all report sections", () => {
    mocks.useIncomeStatement.mockReturnValue({
      data: fixture(),
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(
      screen.getByText("Estado de Resultados · Huevo"),
    ).toBeInTheDocument();
    expect(screen.getByText("Estado de resultados")).toBeInTheDocument();
    expect(screen.getByText("Efectivo del periodo")).toBeInTheDocument();
    expect(screen.getByText("De utilidad a efectivo")).toBeInTheDocument();
    expect(screen.getByText("Ventas y costo por ruta")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Exportar PDF/ }),
    ).toBeInTheDocument();
  });

  it("shows the loading spinner while fetching", () => {
    mocks.useIncomeStatement.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows an error alert when the query fails", () => {
    mocks.useIncomeStatement.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderPage();

    expect(
      screen.getByText("Error al cargar el estado de resultados."),
    ).toBeInTheDocument();
  });
});
