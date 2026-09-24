import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UnitCashCutModal from "../components/UnitCashCutModal";

vi.mock("@/features/employee/api/employees.queries", () => ({
  useEmployees: vi.fn(() => ({
    data: [
      { id: 3, name: "Ana" },
      { id: 4, name: "Luis" },
    ],
  })),
}));

const account = {
  id: 1,
  startingBalance: 1000,
  currentBalance: 1500,
  alertThreshold: 0,
  lastCalculatedAt: null,
  updatedBy: null,
  lastReconciledAt: null,
  trackingStartDate: "2026-09-01",
  lastCutDate: null,
  lastCutOpeningBalance: null,
};

describe("UnitCashCutModal", () => {
  it("saves the cut with the selected responsibles and amounts", () => {
    const onSave = vi.fn();
    render(
      <UnitCashCutModal
        open
        onClose={vi.fn()}
        account={account}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText(/1,500\.00/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Entregado por"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Recibido por"), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/Saldo inicial del nuevo periodo/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/Umbral de Alerta/), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByLabelText("Nota"), {
      target: { value: "Entrega" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Corte de caja/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.handedOverBy).toBe(3);
    expect(payload.receivedBy).toBe(4);
    expect(payload.openingBalance).toBe(100);
    expect(payload.alertThreshold).toBe(50);
    expect(payload.note).toBe("Entrega");
    expect(payload.cutDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("disables the save button until both responsibles are selected", () => {
    render(
      <UnitCashCutModal
        open
        onClose={vi.fn()}
        account={account}
        onSave={vi.fn()}
        isSaving={false}
      />,
    );

    const button = screen.getByRole("button", { name: /Corte de caja/i });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Entregado por"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Recibido por"), {
      target: { value: "4" },
    });

    expect(button).not.toBeDisabled();
  });
});
