import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ClientsRoutesHelpPage } from "../pages/ClientsRoutesHelpPage";

describe("ClientsRoutesHelpPage", () => {
  it("explica clientes, rutas y rentabilidad con preguntas frecuentes", () => {
    render(
      <MemoryRouter initialEntries={["/business/huevo/clients-routes/help"]}>
        <Routes>
          <Route
            path="/business/:slug/clients-routes/help"
            element={<ClientsRoutesHelpPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Cómo funciona Clientes y Rutas"),
    ).toBeInTheDocument();
    expect(screen.getByText("Resumen")).toBeInTheDocument();
    expect(screen.getByText("Rutas por localidad")).toBeInTheDocument();
    expect(screen.getByText("Rendimiento y rentabilidad")).toBeInTheDocument();
    expect(screen.getByText("Preguntas frecuentes")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Volver a Clientes y Rutas/i }),
    ).toBeInTheDocument();
  });
});
