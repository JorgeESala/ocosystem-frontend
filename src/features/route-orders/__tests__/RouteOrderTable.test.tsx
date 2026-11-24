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
    feedText: "",
    eggText: "",
    weight: "",
    cashAmount: "",
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
    feedText: "",
    eggText: "",
    weight: "",
    cashAmount: "",
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

  it("captura pollo, alimento, huevo, peso y efectivo sin total monetario", () => {
    const onChange = vi.fn();
    render(
      <RouteOrderTable
        unitType="LIVE_CHICKEN"
        rows={rows.map((row) => ({
          ...row,
          quantity: "",
          headCount: "25",
          feedText: "485",
          eggText: "4.85",
          weight: "219.616",
          cashAmount: "11200.50",
        }))}
        currentEggPricePerCarton={65}
        onChange={onChange}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Pollo")).toBeInTheDocument();
    expect(screen.getByText("Alimento")).toBeInTheDocument();
    expect(screen.getByText("Huevo")).toBeInTheDocument();
    expect(screen.getByText("Peso")).toBeInTheDocument();
    expect(screen.getByText("Efectivo")).toBeInTheDocument();
    expect(screen.queryByText("Total")).not.toBeInTheDocument();
    expect(screen.queryByText("Verduras")).not.toBeInTheDocument();
    expect(screen.queryByText("Condimentos")).not.toBeInTheDocument();
    expect(screen.queryByText("Abarrotes")).not.toBeInTheDocument();
    expect((screen.getByTestId("quantity-1") as HTMLInputElement).value).toBe(
      "25",
    );
    expect((screen.getByTestId("feed-1") as HTMLInputElement).value).toBe(
      "485",
    );
    expect((screen.getByTestId("egg-1") as HTMLInputElement).value).toBe(
      "4.85",
    );
    expect(screen.getByTestId("feed-1")).toHaveAttribute("maxLength", "200");
    expect(screen.getByTestId("egg-1")).toHaveAttribute("maxLength", "200");
    expect((screen.getByTestId("weight-1") as HTMLInputElement).value).toBe(
      "219.616",
    );
    expect((screen.getByTestId("cash-1") as HTMLInputElement).value).toBe(
      "11200.50",
    );

    fireEvent.change(screen.getByTestId("feed-1"), {
      target: { value: "450" },
    });
    fireEvent.change(screen.getByTestId("egg-1"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByTestId("weight-1"), {
      target: { value: "30.8" },
    });
    fireEvent.change(screen.getByTestId("cash-1"), {
      target: { value: "1601" },
    });

    expect(onChange).toHaveBeenCalledWith(1, { feedText: "450" });
    expect(onChange).toHaveBeenCalledWith(1, { eggText: "3" });
    expect(onChange).toHaveBeenCalledWith(1, { weight: "30.8" });
    expect(onChange).toHaveBeenCalledWith(1, { cashAmount: "1601" });
  });

  it("no muestra las columnas de control en la hoja de huevo", () => {
    render(
      <RouteOrderTable
        unitType="EGG"
        rows={rows}
        currentEggPricePerCarton={65}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByText("Alimento")).not.toBeInTheDocument();
    expect(screen.queryByText("Peso")).not.toBeInTheDocument();
    expect(screen.queryByText("Efectivo")).not.toBeInTheDocument();
    expect(screen.queryByText("Firma")).not.toBeInTheDocument();
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
