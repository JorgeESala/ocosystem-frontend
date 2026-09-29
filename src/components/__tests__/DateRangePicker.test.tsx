import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DateRangePicker from "../DateRangePicker";

describe("DateRangePicker", () => {
  it("anchors the end date popup to the right to avoid clipping", () => {
    render(
      <DateRangePicker
        startDate={new Date(2026, 5, 1)}
        endDate={new Date(2026, 5, 7)}
        onChange={vi.fn()}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);

    fireEvent.focus(inputs[1]);

    expect(document.querySelector(".right-0")).not.toBeNull();
  });
});
