import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { formatMXN } from "@/utils/moneyNumbers";
import IncomeModal from "../components/IncomeModal";
import type {
  CollectionSuggestion,
  TripSuggestion,
} from "../types/eggCashFlow.types";

const trip: TripSuggestion = {
  tripId: 42,
  departureDate: "2026-10-06",
  driverId: 1,
  driverName: "Samuel",
  routeId: 2,
  collectible: 15000,
  collected: 5000,
  pending: 10000,
};

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
  clients: [],
};

const renderModal = (
  trips: TripSuggestion[],
  collections: CollectionSuggestion[],
) =>
  render(
    <IncomeModal
      {...baseProps}
      trips={trips}
      collections={collections}
      initialTripId={null}
      initialPaymentId={null}
    />,
  );

describe("IncomeModal", () => {
  it("keeps the typed amount when the suggestions arrays change identity", () => {
    const { rerender } = renderModal([trip], [collection]);

    const amountInput = screen.getByLabelText("Total cobrado (MXN)");
    fireEvent.change(amountInput, { target: { value: "1234.56" } });

    rerender(
      <IncomeModal
        {...baseProps}
        trips={[{ ...trip }]}
        collections={[{ ...collection }]}
        initialTripId={null}
        initialPaymentId={null}
      />,
    );

    expect(screen.getByLabelText("Total cobrado (MXN)")).toHaveValue(1234.56);
  });

  it("keeps the typed amount when suggestion data refetches with the same content", () => {
    const { rerender } = renderModal([], []);

    const amountInput = screen.getByLabelText("Total cobrado (MXN)");
    fireEvent.change(amountInput, { target: { value: "999" } });

    rerender(
      <IncomeModal
        {...baseProps}
        trips={[]}
        collections={[]}
        initialTripId={null}
        initialPaymentId={null}
      />,
    );

    expect(screen.getByLabelText("Total cobrado (MXN)")).toHaveValue(999);
  });

  it("applies the trip prefill once the suggestion data arrives", () => {
    const { rerender } = renderModal([], []);

    rerender(
      <IncomeModal
        {...baseProps}
        trips={[trip]}
        collections={[collection]}
        initialTripId={42}
        initialPaymentId={null}
      />,
    );

    expect(screen.getByLabelText("Total cobrado (MXN)")).toHaveValue(10000);
    expect(screen.getByLabelText("Enviado a la oficina (MXN)")).toHaveValue(0);
    expect(screen.getByText(formatMXN(10000))).toBeInTheDocument();
    expect(screen.getByLabelText("Concepto")).toHaveValue(
      "Despacho 06 oct 2026 - Samuel",
    );
  });

  it("does not overwrite user input after the prefill was applied", () => {
    const { rerender } = renderModal([], []);

    rerender(
      <IncomeModal
        {...baseProps}
        trips={[trip]}
        collections={[collection]}
        initialTripId={42}
        initialPaymentId={null}
      />,
    );

    const amountInput = screen.getByLabelText("Total cobrado (MXN)");
    fireEvent.change(amountInput, { target: { value: "777" } });

    rerender(
      <IncomeModal
        {...baseProps}
        trips={[{ ...trip }]}
        collections={[{ ...collection }]}
        initialTripId={42}
        initialPaymentId={null}
      />,
    );

    expect(screen.getByLabelText("Total cobrado (MXN)")).toHaveValue(777);
  });

  it("splits the trip total between bank and office", () => {
    const onSave = vi.fn();
    render(
      <IncomeModal
        {...baseProps}
        onSave={onSave}
        trips={[trip]}
        collections={[collection]}
        initialTripId={42}
        initialPaymentId={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Enviado a la oficina (MXN)"), {
      target: { value: "4000" },
    });

    expect(screen.getByText(formatMXN(6000))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Registrar ingreso" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10000,
        officeAmount: 4000,
        tripId: 42,
        account: null,
      }),
    );
  });

  it("defaults a payment collection to the bank", () => {
    const onSave = vi.fn();
    render(
      <IncomeModal
        {...baseProps}
        onSave={onSave}
        trips={[trip]}
        collections={[collection]}
        initialTripId={null}
        initialPaymentId={7}
      />,
    );

    expect(screen.getByLabelText("Destino")).toHaveValue("BANK");
    expect(screen.getByLabelText("Monto (MXN)")).toHaveValue(5000);

    fireEvent.click(screen.getByRole("button", { name: "Registrar ingreso" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5000,
        paymentId: 7,
        account: "BANK",
        officeAmount: null,
      }),
    );
  });
});
