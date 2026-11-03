import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import IncomeModal from "../components/IncomeModal";
import type { CollectionSuggestion } from "../types/eggCashFlow.types";

const collection: CollectionSuggestion = {
  paymentId: 7,
  paymentDate: "2026-10-05",
  amount: 8000,
  folio: null,
  note: null,
  payerName: "Express FCP",
  payerType: "BRANCH",
  payerEntityId: 5,
  collected: 3000,
  pending: 5000,
};

const baseProps = {
  open: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
  isSaving: false,
};

const renderModal = (
  collections: CollectionSuggestion[],
  initialPaymentId: number | null = null,
) =>
  render(
    <IncomeModal
      {...baseProps}
      collections={collections}
      initialPaymentId={initialPaymentId}
    />,
  );

describe("IncomeModal", () => {
  it("keeps the typed amount when the collections array changes identity", () => {
    const { rerender } = renderModal([collection]);

    fireEvent.change(screen.getByLabelText("Monto (MXN)"), {
      target: { value: "1234.56" },
    });

    rerender(
      <IncomeModal
        {...baseProps}
        collections={[{ ...collection }]}
        initialPaymentId={null}
      />,
    );

    expect(screen.getByLabelText("Monto (MXN)")).toHaveValue(1234.56);
  });

  it("applies the payment prefill once the collection data arrives", () => {
    const { rerender } = renderModal([]);

    rerender(
      <IncomeModal
        {...baseProps}
        collections={[collection]}
        initialPaymentId={7}
      />,
    );

    expect(screen.getByLabelText("Monto (MXN)")).toHaveValue(5000);
    expect(screen.getByLabelText("Destino")).toHaveValue("BANK");
    expect(screen.getByLabelText("Concepto")).toHaveValue("Cobro Express FCP");
  });

  it("defaults other income to office cash", () => {
    const onSave = vi.fn();
    render(
      <IncomeModal
        {...baseProps}
        onSave={onSave}
        collections={[collection]}
        initialPaymentId={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Origen"), {
      target: { value: "other" },
    });
    expect(screen.getByLabelText("Destino")).toHaveValue("CASH");

    fireEvent.change(screen.getByLabelText("Monto (MXN)"), {
      target: { value: "300" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar ingreso" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 300,
        account: "CASH",
        paymentId: null,
      }),
    );
  });

  it("saves a payment collection to the bank", () => {
    const onSave = vi.fn();
    render(
      <IncomeModal
        {...baseProps}
        onSave={onSave}
        collections={[collection]}
        initialPaymentId={7}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Registrar ingreso" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5000,
        paymentId: 7,
        account: "BANK",
      }),
    );
  });
});
