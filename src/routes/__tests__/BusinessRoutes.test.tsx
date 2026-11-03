import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { EggCollectionsRedirect } from "../BusinessRoutes";

function LocationDisplay() {
  const location = useLocation();
  return <div>{location.search}</div>;
}

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
            element={<LocationDisplay />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("?mode=COBRAR")).toBeInTheDocument();
  });
});
