import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { EggCollectionsRedirect } from "../BusinessRoutes";

describe("EggCollectionsRedirect", () => {
  it("sends the old collections page to the Cobrar tab", () => {
    render(
      <MemoryRouter initialEntries={["/business/huevo/collections"]}>
        <Routes>
          <Route
            path="/business/:slug/collections"
            element={<EggCollectionsRedirect />}
          />
          <Route
            path="/business/:slug/accounting"
            element={<div>Contabilidad</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Contabilidad")).toBeInTheDocument();
  });
});
