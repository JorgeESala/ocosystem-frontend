import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it("closes with Escape from the focused trigger or the document", () => {
    const { trigger } = renderTooltip();

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("keeps the tooltip open when its content scrolls", () => {
    const { trigger } = renderTooltip();

    fireEvent.mouseEnter(trigger);

    fireEvent.scroll(screen.getByRole("tooltip"));
    expect(screen.getByRole("tooltip")).toBeTruthy();

    fireEvent.scroll(window);
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

  it("includes the visible value in the accessible name", () => {
    render(
      <CalculationTooltip
        valueLabel="15.5 kg"
        birdsSold={10}
        avgChickenWeight={1.8}
        expectedKg={15.5}
        pricePerKg={50}
        expectedMoney={775}
      >
        15.5 kg
      </CalculationTooltip>,
    );

    expect(
      screen.getByLabelText("15.5 kg. Ver cálculo de la venta esperada"),
    ).toBeTruthy();
  });

  it("clamps the tooltip to the bottom of the viewport", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.getAttribute("role") === "tooltip") {
          return {
            top: 0,
            left: 0,
            right: 320,
            bottom: 700,
            width: 320,
            height: 700,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          } as DOMRect;
        }
        return {
          top: 80,
          left: 100,
          right: 200,
          bottom: 100,
          width: 100,
          height: 20,
          x: 100,
          y: 80,
          toJSON: () => ({}),
        } as DOMRect;
      },
    );

    const { trigger } = renderTooltip();
    fireEvent.mouseEnter(trigger);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.style.top).toBe(
      `${Math.min(108, window.innerHeight - 700 - 8)}px`,
    );
  });
});
