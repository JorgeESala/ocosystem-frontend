import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UnitCashSettingsModal from "../components/UnitCashSettingsModal";

vi.mock("@/features/employee/api/employees.queries", () => ({
  useEmployees: vi.fn(() => ({ data: [] })),
}));

describe("UnitCashSettingsModal", () => {
  it("shows the tracking start date read-only", () => {
    render(
      <UnitCashSettingsModal
        open
        onClose={vi.fn()}
        account={{
          id: 1,
          startingBalance: 1000,
          currentBalance: 1000,
          alertThreshold: 100,
          lastCalculatedAt: null,
          updatedBy: null,
          lastReconciledAt: null,
          trackingStartDate: "2026-09-23",
        }}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        isSaving={false}
        isRecalculating={false}
      />,
    );

    expect(
      screen.getByText(/Movimientos registrados desde:/),
    ).toBeInTheDocument();
  });
});
