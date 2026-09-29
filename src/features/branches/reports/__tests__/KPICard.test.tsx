import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HiCurrencyDollar } from "react-icons/hi";
import { KPICard } from "../components/KPICard";

describe("KPICard", () => {
  it("is not interactive without onClick", () => {
    render(
      <KPICard
        title="Venta Real"
        value="$1,000"
        color="blue"
        icon={HiCurrencyDollar}
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("calls onClick when clicked and shows the hint", () => {
    const onClick = vi.fn();
    render(
      <KPICard
        title="Venta Real"
        value="$1,000"
        color="blue"
        icon={HiCurrencyDollar}
        onClick={onClick}
        actionHint="Ver ranking"
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Ver ranking/)).toBeTruthy();
  });

  it("supports keyboard activation", () => {
    const onClick = vi.fn();
    render(
      <KPICard
        title="Venta Real"
        value="$1,000"
        color="blue"
        icon={HiCurrencyDollar}
        onClick={onClick}
      />,
    );

    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter" });
    fireEvent.keyDown(card, { key: " " });

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
