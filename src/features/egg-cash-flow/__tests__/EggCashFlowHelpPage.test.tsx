import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EggCashFlowHelpPage from "../pages/EggCashFlowHelpPage";

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
    expect(screen.getByText("Primeros pasos")).toBeInTheDocument();
    expect(screen.getByText("Preguntas frecuentes")).toBeInTheDocument();
    expect(screen.getByText("Glosario")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Volver al flujo/ }),
    ).toHaveAttribute("href", "/business/huevo/cash-flow");
  });
});
