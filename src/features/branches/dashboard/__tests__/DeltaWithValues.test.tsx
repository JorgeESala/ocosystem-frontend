import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DeltaWithValues from "../components/DeltaWithValues";

describe("DeltaWithValues", () => {
  it("shows the compared values in full currency", () => {
    render(<DeltaWithValues value={-9.7} current={2000} previous={1500} />);

    expect(screen.getByText(/9\.7%/)).toBeTruthy();
    expect(
      screen.getByText("Actual: $2,000.00 · Anterior: $1,500.00"),
    ).toBeTruthy();
    expect(screen.queryByText(/Comparativa sin/)).toBeNull();
  });

  it("notes the trimmed basis when days were excluded", () => {
    render(
      <DeltaWithValues
        value={-9.7}
        current={2000}
        previous={1500}
        trimmedDays={2}
      />,
    );

    expect(screen.getByText(/Comparativa sin 2 días/)).toBeTruthy();
  });

  it("uses singular day for a single excluded day", () => {
    render(
      <DeltaWithValues
        value={-9.7}
        current={2000}
        previous={1500}
        trimmedDays={1}
      />,
    );

    expect(screen.getByText(/Comparativa sin 1 día/)).toBeTruthy();
  });

  it("shows no tooltip without a comparison", () => {
    render(<DeltaWithValues value={null} current={0} previous={null} />);

    expect(screen.getByText("Sin comparativo")).toBeTruthy();
    expect(screen.queryByText(/Actual:/)).toBeNull();
  });
});
