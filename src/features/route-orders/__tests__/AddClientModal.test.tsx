import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Client } from "@/core/api/types";
import { AddClientModal } from "../components/AddClientModal";

const businessOnlyClient = {
  id: 7,
  name: null,
  businessName: "Abarrotes Rosa",
  localityName: "Centro",
  isInternalBranch: false,
} as unknown as Client;

describe("AddClientModal", () => {
  it("lists and searches clients that only have a business name", () => {
    const onAdd = vi.fn();
    render(
      <AddClientModal
        open
        clients={[businessOnlyClient]}
        onClose={vi.fn()}
        onAdd={onAdd}
      />,
    );

    fireEvent.click(screen.getByText("Buscar cliente por nombre"));
    fireEvent.change(screen.getByPlaceholderText("Buscar cliente por nombre"), {
      target: { value: "r" },
    });
    fireEvent.click(screen.getByText("Abarrotes Rosa"));
    fireEvent.click(screen.getByRole("button", { name: "Agregar cliente" }));

    expect(onAdd).toHaveBeenCalledWith(businessOnlyClient);
  });

  it("does not repeat the business name as subtitle when it is the label", () => {
    render(
      <AddClientModal
        open
        clients={[businessOnlyClient]}
        onClose={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Buscar cliente por nombre"));

    expect(screen.getByText("Abarrotes Rosa")).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(
      screen.queryByText("Abarrotes Rosa · Centro"),
    ).not.toBeInTheDocument();
  });
});
