import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountingToast } from "../components/AccountingToast";

describe("AccountingToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a failure message with its title", () => {
    render(
      <AccountingToast
        message="La fecha del despacho es anterior al inicio de Flujo de efectivo."
        onDismiss={vi.fn()}
        variant="failure"
        title="No se pudo confirmar la cobranza"
        autoDismissMs={8000}
      />,
    );

    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    expect(
      screen.getByText("No se pudo confirmar la cobranza"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "La fecha del despacho es anterior al inicio de Flujo de efectivo.",
      ),
    ).toBeInTheDocument();
  });

  it("auto-dismisses the failure message after the configured time", () => {
    const onDismiss = vi.fn();
    render(
      <AccountingToast
        message="Error"
        onDismiss={onDismiss}
        variant="failure"
        autoDismissMs={8000}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(7999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("can be dismissed manually", () => {
    const onDismiss = vi.fn();
    render(
      <AccountingToast
        message="Error"
        onDismiss={onDismiss}
        variant="failure"
        autoDismissMs={8000}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("keeps the success variant behavior", () => {
    render(<AccountingToast message="Guardado" onDismiss={vi.fn()} />);

    expect(screen.getByText("Guardado")).toBeInTheDocument();
  });
});
