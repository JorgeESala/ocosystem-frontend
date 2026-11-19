import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BranchExpenseForm from "../components/BranchExpenseForm";
import type { BranchExpenseResponseDTO } from "../types";

const mocks = vi.hoisted(() => ({
  useBranches: vi.fn(),
  useExpenseCategories: vi.fn(),
  useBranchBusinessCategories: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
}));

vi.mock("@/features/branches/branch/branch.queries", () => ({
  useBranches: mocks.useBranches,
}));

vi.mock("../api/branch-categories.queries", () => ({
  useExpenseCategories: mocks.useExpenseCategories,
  useBranchBusinessCategories: mocks.useBranchBusinessCategories,
}));

vi.mock("../api/branch-expenses.queries", () => ({
  useCreateBranchExpense: () => ({
    mutate: mocks.createExpense,
    isPending: false,
  }),
  useUpdateBranchExpense: () => ({
    mutate: mocks.updateExpense,
    isPending: false,
  }),
}));

vi.mock("flowbite-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("flowbite-react")>();
  return {
    ...actual,
    Datepicker: ({ value }: { value?: Date | null }) => (
      <input
        data-testid="mock-datepicker"
        value={value ? value.toISOString().slice(0, 10) : ""}
        onChange={() => undefined}
      />
    ),
  };
});

const renderForm = () =>
  render(<BranchExpenseForm onSaved={vi.fn()} onCancel={vi.fn()} />);

describe("BranchExpenseForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useBranches.mockReturnValue({
      data: [{ id: 7, name: "Centro" }],
      isLoading: false,
    });
    mocks.useExpenseCategories.mockReturnValue({
      data: [
        {
          id: 1,
          name: "Servicios",
          parentId: null,
          sortOrder: 20,
          active: true,
          selectable: false,
        },
        {
          id: 2,
          name: "Luz",
          parentId: 1,
          parentName: "Servicios",
          sortOrder: 20,
          active: true,
          selectable: true,
        },
        {
          id: 4,
          name: "Costo de ventas",
          parentId: null,
          sortOrder: 10,
          active: true,
          selectable: false,
        },
        {
          id: 5,
          name: "Gas LP",
          parentId: 4,
          parentName: "Costo de ventas",
          sortOrder: 30,
          active: true,
          selectable: true,
        },
      ],
      isLoading: false,
    });
    mocks.useBranchBusinessCategories.mockReturnValue({
      data: [{ id: 21, name: "Pollo" }],
      isLoading: false,
    });
  });

  it("groups selectable leaf categories by their parent", () => {
    renderForm();

    expect(screen.getByRole("group", { name: "Servicios" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Costo de ventas" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Luz" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Gas LP" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Servicios" })).toBeNull();
  });

  it("submits the selected leaf category and business unit", () => {
    renderForm();

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "7" } });
    fireEvent.change(selects[1], { target: { value: "2" } });
    fireEvent.change(selects[2], { target: { value: "21" } });
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "150" },
    });
    fireEvent.change(screen.getAllByRole("textbox")[0], {
      target: { value: "Pago de luz" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(mocks.createExpense).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 7,
        expenseCategoryId: 2,
        businessUnitCategoryId: 21,
        amount: 150,
        reason: "Pago de luz",
      }),
      expect.any(Object),
    );
  });

  it("keeps the historical category visible when editing an old expense", () => {
    const historical: BranchExpenseResponseDTO = {
      id: 9,
      branchId: 7,
      branchName: "Centro",
      expenseCategoryId: 99,
      expenseCategoryName: "Compra de pollo",
      amount: 500,
      date: "2026-01-15",
      reason: "Compra histórica",
    };

    render(
      <BranchExpenseForm
        initialData={historical}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("option", { name: "Compra de pollo (histórico)" }),
    ).toBeTruthy();
    expect((screen.getAllByRole("combobox")[1] as HTMLSelectElement).value).toBe(
      "99",
    );
  });
});
