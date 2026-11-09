import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SettingsModal from "../components/SettingsModal";

const renderModal = () =>
  render(
    <SettingsModal
      open
      onClose={vi.fn()}
      settings={null}
      clients={[]}
      onSave={vi.fn()}
      isSaving={false}
    />,
  );

describe("SettingsModal", () => {
  it("uses the configured account holder name in the copy", () => {
    renderModal();

    expect(
      screen.getByLabelText("Saldo inicial de la cuenta del titular (MXN)"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Titular de la cuenta"), {
      target: { value: "Enrique" },
    });

    expect(
      screen.getByLabelText("Saldo inicial de la cuenta de Enrique (MXN)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El destino real depende de la forma de pago/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/efectivo entra a efectivo en oficina/i),
    ).toBeInTheDocument();
  });

  it("explains that office cash is automatic and real cash is captured at close", () => {
    renderModal();

    expect(
      screen.getByText(/El efectivo en oficina se calcula automáticamente/),
    ).toBeInTheDocument();
  });

  it("captures the weekly office cash target", () => {
    const onSave = vi.fn();
    render(
      <SettingsModal
        open
        onClose={vi.fn()}
        settings={null}
        clients={[]}
        onSave={onSave}
        isSaving={false}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("Efectivo objetivo en oficina cada viernes (MXN)"),
      { target: { value: "1200" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Crear configuración" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ weeklyCashTarget: 1200 }),
    );
  });
});
