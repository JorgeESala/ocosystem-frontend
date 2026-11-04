import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RouteOrderTable } from "../components/RouteOrderTable";
import type { RouteOrderDraftRow } from "../types/routeOrder.types";

const rows: RouteOrderDraftRow[] = [
  {
    key: "client-1",
    clientId: 1,
    clientName: "Cliente Uno",
    businessName: "Abarrotes Uno",
    localityName: "Centro",
    quantity: "18",
    unitPrice: "65",
    lastSalePricePerCarton: 60,
    lastSalePricePerKg: 30,
    vegetables: "Tomate",
    condiments: "",
    groceries: "",
    comments: "",
    added: false,
  },
  {
    key: "client-2",
    clientId: 2,
    clientName: "Cliente Dos",
    businessName: "Abarrotes Dos",
    localityName: "Centro",
    quantity: "",
    unitPrice: "65",
    lastSalePricePerCarton: null,
    lastSalePricePerKg: null,
    vegetables: "",
    condiments: "",
    groceries: "",
    comments: "",
    added: true,
  },
];

describe("RouteOrderTable", () => {
  it("muestra precios, totales y permite editar la cantidad", () => {
    const onChange = vi.fn();
    render(
      <RouteOrderTable
        unitType="EGG"
        rows={rows}
        currentEggPricePerCarton={65}
        onChange={onChange}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Cliente Uno")).toBeInTheDocument();
    expect(screen.getByText("$60.00")).toBeInTheDocument();
    expect(screen.getAllByText("$65.00").length).toBeGreaterThan(0);
    const boxPriceInputs = screen
      .getAllByRole("spinbutton")
      .filter((input) => input.getAttribute("step") === "0.01");
    expect(
      boxPriceInputs.some(
        (input) => (input as HTMLInputElement).value === "780",
      ),
    ).toBe(true);
    expect(screen.getByText("$1,170.00")).toBeInTheDocument();

    const quantityInput = screen
      .getAllByRole("spinbutton")
      .find((input) => input.getAttribute("step") === "0.001");
    fireEvent.change(quantityInput as HTMLElement, {
      target: { value: "24" },
    });

    expect(onChange).toHaveBeenCalledWith(1, { quantity: "24" });
  });

  it("permite quitar clientes agregados de otra ruta", () => {
    const onRemove = vi.fn();
    render(
      <RouteOrderTable
        unitType="EGG"
        rows={rows}
        currentEggPricePerCarton={65}
        onChange={vi.fn()}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByTitle("Quitar cliente de esta hoja"));

    expect(onRemove).toHaveBeenCalledWith(2);
  });
});
