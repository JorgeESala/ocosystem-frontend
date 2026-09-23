import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UnitCashAdjustmentList from "../components/UnitCashAdjustmentList";

const mocks = vi.hoisted(() => ({
  useUnitCashAdjustments: vi.fn(),
  useDeleteUnitCashAdjustment: vi.fn(),
}));

vi.mock("../api/unitCash.queries", () => ({
  useUnitCashAdjustments: mocks.useUnitCashAdjustments,
  useDeleteUnitCashAdjustment: mocks.useDeleteUnitCashAdjustment,
}));

vi.mock("@/features/employee/api/employees.queries", () => ({
  useEmployees: vi.fn(() => ({ data: [{ id: 7, name: "Ana" }] })),
}));

describe("UnitCashAdjustmentList audit", () => {
  it("shows who registered the adjustment", () => {
    mocks.useUnitCashAdjustments.mockReturnValue({
      data: [
        {
          id: 1,
          amount: 50,
          reason: "Faltante",
          date: "2026-09-20",
          createdAt: "2026-09-20T10:00:00",
          createdBy: 7,
          updatedBy: 7,
        },
      ],
    });
    mocks.useDeleteUnitCashAdjustment.mockReturnValue({ mutate: vi.fn() });

    render(
      <UnitCashAdjustmentList
        unit="EGG"
        startDate={new Date()}
        endDate={new Date()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText(/Registrado por Ana/)).toBeInTheDocument();
  });
});
