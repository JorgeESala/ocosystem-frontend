import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { DateRangePresets } from "../components/DateRangePresets";

const presets = () => within(screen.getByTestId("date-range-presets"));

describe("DateRangePresets", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 15, 10, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders today and the existing range shortcuts", () => {
    render(<DateRangePresets onSelect={vi.fn()} />);

    expect(presets().getByRole("button", { name: "Hoy" })).toBeTruthy();
    expect(presets().getByRole("button", { name: "7D" })).toBeTruthy();
    expect(presets().getByRole("button", { name: "14D" })).toBeTruthy();
    expect(presets().getByRole("button", { name: "30D" })).toBeTruthy();
    expect(presets().getByRole("button", { name: "90D" })).toBeTruthy();
  });

  it("selects only the current day for Hoy", () => {
    const onSelect = vi.fn();
    render(<DateRangePresets onSelect={onSelect} />);

    fireEvent.click(presets().getByRole("button", { name: "Hoy" }));

    const [start, end] = onSelect.mock.calls[0];
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(8);
    expect(start.getDate()).toBe(15);
    expect(start.getHours()).toBe(0);
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(8);
    expect(end.getDate()).toBe(15);
  });

  it("keeps the rolling window for 7D", () => {
    const onSelect = vi.fn();
    render(<DateRangePresets onSelect={onSelect} />);

    fireEvent.click(presets().getByRole("button", { name: "7D" }));

    const [start, end] = onSelect.mock.calls[0];
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(8);
    expect(start.getDate()).toBe(9);
    expect(end.getDate()).toBe(15);
  });
});
