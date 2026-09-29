import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { TopCategoryToggles } from "../components/TopCategoryToggles";

const checkboxes = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLInputElement>("input[type=checkbox]"),
  );

describe("TopCategoryToggles", () => {
  it("notifies chicken toggles keeping the egg value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <TopCategoryToggles
        hideChicken={false}
        hideEgg={true}
        onChange={onChange}
      />,
    );

    const [chicken] = checkboxes(container);
    fireEvent.click(chicken);

    expect(onChange).toHaveBeenCalledWith(true, true);
  });

  it("notifies egg toggles keeping the chicken value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <TopCategoryToggles
        hideChicken={true}
        hideEgg={false}
        onChange={onChange}
      />,
    );

    const [, egg] = checkboxes(container);
    fireEvent.click(egg);

    expect(onChange).toHaveBeenCalledWith(true, true);
  });
});
