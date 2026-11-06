import { useState } from "react";
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
    isInternalBranch: false,
    isInternalClient: false,
    headCount: "",
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
    isInternalBranch: false,
    isInternalClient: false,
    headCount: "",
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

function PriceSyncHarness() {
  const [row, setRow] = useState(rows[0]);
  return (
    <RouteOrderTable
      unitType="EGG"
      rows={[row]}
      currentEggPricePerCarton={65}
      onChange={(_clientId, patch) =>
        setRow((previous) => ({ ...previous, ...patch }))
      }
      onRemove={vi.fn()}
    />
  );
}

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

  it("sincroniza el precio por casillero y por caja en ambos sentidos", () => {
    render(<PriceSyncHarness />);

    fireEvent.change(screen.getByTestId("unit-price-1"), {
      target: { value: "70" },
    });
    expect((screen.getByTestId("box-price-1") as HTMLInputElement).value).toBe(
      "840",
    );

    fireEvent.change(screen.getByTestId("box-price-1"), {
      target: { value: "800" },
    });
    expect((screen.getByTestId("unit-price-1") as HTMLInputElement).value).toBe(
      "66.6667",
    );
    expect((screen.getByTestId("box-price-1") as HTMLInputElement).value).toBe(
      "800",
    );
  });

  it("captura cabezas en pollo vivo y no muestra total monetario", () => {
    render(
      <RouteOrderTable
        unitType="LIVE_CHICKEN"
        rows={rows.map((row) => ({
          ...row,
          quantity: "",
          headCount: "25",
        }))}
        currentEggPricePerCarton={65}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Cabezas")).toBeInTheDocument();
    expect(screen.queryByText("Total")).not.toBeInTheDocument();
    expect((screen.getByTestId("quantity-1") as HTMLInputElement).value).toBe(
      "25",
    );
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
