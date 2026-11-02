import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BusinessTopBar from "../BusinessTopBar";

const mocks = vi.hoisted(() => ({
  allowedBusinesses: ["EGG", "BRANCHES"] as string[],
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { allowedBusinesses: mocks.allowedBusinesses },
  }),
}));

const renderBar = (pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <BusinessTopBar />
    </MemoryRouter>,
  );

describe("BusinessTopBar", () => {
  beforeEach(() => {
    mocks.allowedBusinesses = ["EGG", "BRANCHES"];
  });

  it("shows the current unit and its breadcrumbs", () => {
    renderBar("/business/huevo/accounting");

    expect(
      screen.getByRole("button", { name: "Cambiar unidad de negocio" }),
    ).toHaveTextContent("Huevo");
    expect(screen.getByText("Finanzas")).toBeInTheDocument();
    expect(screen.getByText("Contabilidad")).toBeInTheDocument();
  });

  it("switches to another unit and opens its home", () => {
    renderBar("/business/huevo/accounting");

    fireEvent.click(
      screen.getByRole("button", { name: "Cambiar unidad de negocio" }),
    );
    fireEvent.click(screen.getByText("Sucursales"));

    expect(
      screen.getByRole("button", { name: "Cambiar unidad de negocio" }),
    ).toHaveTextContent("Sucursales");
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("shows a static unit label when the user has only one unit", () => {
    mocks.allowedBusinesses = ["EGG"];
    renderBar("/business/huevo/accounting");

    expect(screen.getByText("Huevo")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cambiar unidad de negocio" }),
    ).not.toBeInTheDocument();
  });
});
