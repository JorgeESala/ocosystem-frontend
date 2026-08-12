import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EntityMultiSelect } from "../EntityMultiSelect";

const items = [
  { id: 1, name: "Roneli" },
  { id: 2, name: "Saban" },
  { id: 3, name: "Esperanza" },
];

function Controlled() {
  const [selected, setSelected] = useState<number[]>([1, 2, 3]);
  return (
    <EntityMultiSelect
      items={items}
      selected={selected}
      onChange={setSelected}
      label="Sucursales"
      placeholder="Seleccionar sucursales"
    />
  );
}

const openDropdown = () => {
  fireEvent.click(screen.getByText("Seleccionar sucursales"));
};

describe("EntityMultiSelect - select all", () => {
  it("selects all items when clicked with none selected", () => {
    const onChange = vi.fn();
    render(
      <EntityMultiSelect
        items={items}
        selected={[]}
        onChange={onChange}
        label="Sucursales"
        placeholder="Seleccionar sucursales"
      />,
    );

    openDropdown();
    fireEvent.click(screen.getByText("Seleccionar todas"));

    expect(onChange).toHaveBeenLastCalledWith([1, 2, 3]);
  });

  it("unselects all when clicked with every item selected", () => {
    const onChange = vi.fn();
    render(
      <EntityMultiSelect
        items={items}
        selected={[1, 2, 3]}
        onChange={onChange}
        label="Sucursales"
        placeholder="Seleccionar sucursales"
      />,
    );

    openDropdown();
    fireEvent.click(screen.getByText("Seleccionar todas"));

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("unselects all when the select-all checkbox itself is clicked", () => {
    render(<Controlled />);

    openDropdown();
    const checkbox = screen
      .getByText("Seleccionar todas")
      .closest("div")!
      .querySelector('input[type="checkbox"]') as HTMLInputElement;

    fireEvent.click(checkbox);

    expect(screen.getByText("Ninguna seleccionada")).toBeInTheDocument();
  });

  it("toggles a single item only once when its checkbox is clicked", () => {
    render(<Controlled />);

    openDropdown();
    const row = screen
      .getAllByText("Saban")
      .map((el) => el.closest("li"))
      .find((el) => el !== null)!;
    const checkbox = row.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;

    fireEvent.click(checkbox);

    const selectedBadge = (name: string) =>
      screen
        .getAllByText(name)
        .filter((el) => el.closest('[data-testid="flowbite-badge"]'));

    expect(selectedBadge("Roneli")).toHaveLength(1);
    expect(selectedBadge("Esperanza")).toHaveLength(1);
    expect(selectedBadge("Saban")).toHaveLength(0);
  });
});
