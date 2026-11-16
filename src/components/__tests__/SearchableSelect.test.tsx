import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchableSelect } from "../SearchableSelect";

interface Item {
  id: number;
  name: string | null;
}

const items: Item[] = [
  { id: 1, name: null },
  { id: 2, name: "Rosa" },
];

describe("SearchableSelect", () => {
  it("does not crash when a label is null", () => {
    render(
      <SearchableSelect
        items={items}
        selected={null}
        onChange={vi.fn()}
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        placeholder="Buscar cliente"
      />,
    );

    fireEvent.click(screen.getByText("Buscar cliente"));
    fireEvent.change(screen.getByPlaceholderText("Buscar cliente"), {
      target: { value: "zzz" },
    });

    expect(
      screen.getByText("No se encontraron coincidencias"),
    ).toBeInTheDocument();
  });
});
