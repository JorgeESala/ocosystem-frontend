import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpectedCalculationContent } from "../components/ExpectedCalculationContent";

describe("ExpectedCalculationContent", () => {
  it("shows the kilograms and money operations", () => {
    render(
      <ExpectedCalculationContent
        scopeLabel="Centro"
        birdsSold={120}
        avgChickenWeight={1.85}
        expectedKg={192}
        pricePerKg={55}
        expectedMoney={10560}
        exactMoney
      />,
    );

    expect(
      screen.getByText(/Peso promedio de la remesa: 1.85 kg/),
    ).toBeTruthy();
    expect(screen.getByText(/Merma por pollo: 0.25 kg/)).toBeTruthy();
    expect(screen.getByText(/Pollos vendidos: 120/)).toBeTruthy();
    expect(
      screen.getByText(/\(1.85 kg − 0.25 kg\) × 120 = 192 kg/),
    ).toBeTruthy();
    expect(
      screen.getByText(/192 × \$55\.00 \/ kg = \$10,560\.00/),
    ).toBeTruthy();
  });

  it("explains the aggregate money when the days are not exact", () => {
    render(
      <ExpectedCalculationContent
        birdsSold={120}
        avgChickenWeight={1.85}
        expectedKg={192}
        pricePerKg={55}
        expectedMoney={10560}
      />,
    );

    expect(screen.getByText(/Precio efectivo: \$55\.00 \/ kg/)).toBeTruthy();
    expect(screen.getByText(/Mínimo comparable: \$10,560\.00/)).toBeTruthy();
    expect(
      screen.getByText(
        "Suma de kg esperados × precio de cada día con precio y monto registrado.",
      ),
    ).toBeTruthy();
    expect(
      screen
        .getByText("Mínimo en dinero")
        .compareDocumentPosition(screen.getByText("Kilos esperados")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("labels the total minimum when the call site uses the total", () => {
    render(
      <ExpectedCalculationContent
        birdsSold={120}
        avgChickenWeight={1.85}
        expectedKg={192}
        pricePerKg={55}
        expectedMoney={10560}
        moneyLabel="Mínimo total"
        moneyNote="Suma de kg esperados × precio de cada día con precio de referencia; incluye días sin monto registrado."
      />,
    );

    expect(screen.getByText(/Mínimo total: \$10,560\.00/)).toBeTruthy();
    expect(
      screen.getByText(
        "Suma de kg esperados × precio de cada día con precio de referencia; incluye días sin monto registrado.",
      ),
    ).toBeTruthy();
  });

  it("shows partial warnings even when a minimum exists", () => {
    render(
      <ExpectedCalculationContent
        birdsSold={120}
        avgChickenWeight={1.85}
        expectedKg={192}
        pricePerKg={55}
        expectedMoney={10560}
        missingPrice
        missingAmount
      />,
    );

    expect(
      screen.getByText("Falta precio de referencia en uno o más días."),
    ).toBeTruthy();
    expect(
      screen.getByText("Falta monto registrado en una o más ventas."),
    ).toBeTruthy();
  });

  it("shows the missing reference states", () => {
    render(<ExpectedCalculationContent missingProduct />);
    expect(screen.getByText("Sin producto de referencia.")).toBeTruthy();
    expect(screen.getByText("Sin mínimo calculado.")).toBeTruthy();

    render(<ExpectedCalculationContent missingPrice />);
    expect(
      screen.getByText("Falta precio de referencia en uno o más días."),
    ).toBeTruthy();
  });

  it("distinguishes a missing registered amount", () => {
    render(
      <ExpectedCalculationContent
        birdsSold={120}
        avgChickenWeight={1.85}
        expectedKg={192}
        pricePerKg={55}
        missingAmount
      />,
    );

    expect(
      screen.getByText("Falta monto registrado en una o más ventas."),
    ).toBeTruthy();
  });
});
