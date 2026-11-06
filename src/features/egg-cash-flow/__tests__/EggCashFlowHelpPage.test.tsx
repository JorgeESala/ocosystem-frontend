import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EggCashFlowHelpPage from "../pages/EggCashFlowHelpPage";

vi.mock("../api/eggCashFlow.queries", () => ({
  useCashFlowSettings: () => ({
    data: { accountHolder: "Enrique" },
    isLoading: false,
    isError: false,
  }),
}));

describe("EggCashFlowHelpPage", () => {
  it("renders the guide content and the back link", () => {
    render(
      <MemoryRouter initialEntries={["/business/huevo/cash-flow/help"]}>
        <Routes>
          <Route
            path="/business/:slug/cash-flow/help"
            element={<EggCashFlowHelpPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Cómo funciona el Flujo de efectivo"),
    ).toBeInTheDocument();
    expect(screen.getByText("Cómo se mueve el dinero")).toBeInTheDocument();
    expect(screen.getByText("Primeros pasos")).toBeInTheDocument();
    expect(screen.getByText("Preguntas frecuentes")).toBeInTheDocument();
    expect(screen.getByText("Glosario")).toBeInTheDocument();
    expect(
      screen.getByText("Cerrar la semana paso a paso"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Efectivo en oficina es el efectivo que quedó/),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Cerrar semana/).length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/Efectivo en oficina \(saldo\)/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/“la cuenta del titular” es la cuenta de Enrique/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Volver al flujo/ }),
    ).toHaveAttribute("href", "/business/huevo/cash-flow");
  });
});
