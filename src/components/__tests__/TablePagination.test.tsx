import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TablePagination from "../TablePagination";

describe("TablePagination", () => {
  it("shows the visible range and navigates pages", () => {
    const onPageChange = vi.fn();

    render(
      <TablePagination
        page={0}
        pageSize={25}
        total={116}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText("Mostrando 1–25 de 116")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("changes the page size", () => {
    const onPageSizeChange = vi.fn();

    render(
      <TablePagination
        page={0}
        pageSize={25}
        total={116}
        onPageChange={() => undefined}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Por página"), {
      target: { value: "50" },
    });

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("hides navigation for a single page without page-size control", () => {
    render(
      <TablePagination
        page={0}
        pageSize={25}
        total={10}
        onPageChange={() => undefined}
      />,
    );

    expect(screen.queryByRole("button", { name: "Siguiente" })).toBeNull();
    expect(screen.getByText("Mostrando 1–10 de 10")).toBeTruthy();
  });
});
