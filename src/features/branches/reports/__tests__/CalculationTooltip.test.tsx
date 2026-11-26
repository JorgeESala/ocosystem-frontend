import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CalculationTooltip } from "../components/CalculationTooltip";

const renderTooltip = (onParentClick = vi.fn()) => {
  render(
    <div
      className="overflow-x-auto"
      data-testid="scroll-container"
      onClick={onParentClick}
    >
      <CalculationTooltip
        birdsSold={10}
        avgChickenWeight={1.8}
        expectedKg={15.5}
        pricePerKg={50}
        expectedMoney={775}
      >
        15.5 kg
      </CalculationTooltip>
    </div>,
  );

  return {
    onParentClick,
    trigger: screen.getByLabelText("Ver cálculo de la venta esperada"),
  };
};

describe("CalculationTooltip", () => {
  it("renders the calculation outside the scroll container", () => {
    const { trigger } = renderTooltip();

    fireEvent.mouseEnter(trigger);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toBeTruthy();
    expect(tooltip.closest('[data-testid="scroll-container"]')).toBeNull();
    expect(document.body.contains(tooltip)).toBe(true);
    expect(screen.getByText(/Mínimo comparable: \$775\.00/)).toBeTruthy();
  });

  it("opens on focus and closes with Escape or an outside pointer", () => {
    const { trigger } = renderTooltip();

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("toggles with a touch tap and keeps taps inside the tooltip", () => {
    const { trigger } = renderTooltip();

    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.pointerDown(screen.getByRole("tooltip"));
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("does not bubble the trigger click to the card", () => {
    const { onParentClick, trigger } = renderTooltip();

    fireEvent.click(trigger);

    expect(onParentClick).not.toHaveBeenCalled();
  });
});
