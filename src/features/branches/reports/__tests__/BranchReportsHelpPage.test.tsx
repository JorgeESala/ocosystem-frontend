import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BranchReportsHelpPage from "../pages/BranchReportsHelpPage";

describe("BranchReportsHelpPage", () => {
  it("renders the guide content", () => {
    render(
      <MemoryRouter initialEntries={["/business/sucursales/reports/help"]}>
        <Routes>
          <Route
            path="/business/:slug/reports/help"
            element={<BranchReportsHelpPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Cómo leer los reportes de sucursales"),
    ).toBeTruthy();
    expect(screen.getByText("Preguntas frecuentes")).toBeTruthy();
    expect(screen.getByText("Venta Real")).toBeTruthy();
  });
});
