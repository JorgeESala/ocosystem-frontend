import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TripCollectionsPanel } from "../components/collections/TripCollectionsPanel";
import type { TripCollection } from "../types/collection.types";
import type { BulkPaymentResult } from "../types/payment.types";
import { toLocalDateString } from "@/utils/date.utils";
import { openCollectionsSheet } from "../utils/collectionsSheet";

const mocks = vi.hoisted(() => ({
  useRoutes: vi.fn(),
  useTripCollections: vi.fn(),
  bulkMutate: vi.fn(),
  rowMutate: vi.fn(),
  bulkPayload: null as unknown,
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: mocks.useRoutes,
}));

vi.mock("../api/collections.queries", () => ({
  useTripCollections: mocks.useTripCollections,
}));

vi.mock("@/features/egg-cash-flow/api/eggCashFlow.queries", () => ({
  useCollectionAvailability: () => ({
    data: { writable: true, reason: "OK", message: null },
  }),
}));

vi.mock("../api/payments.queries", () => ({
  useCreateBulkFifoPayments: () => ({
    mutate: mocks.bulkMutate,
    isPending: false,
  }),
  useCreateFifoPayment: () => ({
    mutate: mocks.rowMutate,
    isPending: false,
  }),
}));

vi.mock("../utils/collectionsSheet", () => ({
  openCollectionsSheet: vi.fn(),
  openDayCollectionsSheet: vi.fn(),
}));

const trip: TripCollection = {
  tripId: 7,
  departureDate: toLocalDateString(new Date()),
  driverId: 2,
  driverName: "Chofer Uno",
  routeId: 3,
  routeName: "Ruta Norte",
  vehicleName: "CamiÃƒÂ³n 1",
  saleCount: 2,
  totalSold: 800,
  cashOnlyTotal: 300,
  clients: [
    {
      clientId: 10,
      clientName: "Cliente Crédito",
      phone: "555-100-2000",
      accountingEntityId: 88,
      saleTotal: 500,
      saldoTotal: 900,
      oldestDebtDate: "2026-09-01",
      saleCedisBalances: [
        { creditorId: 1, creditorName: "CEDIS Norte", saleTotal: 500 },
      ],
      cedisBalances: [
        {
          creditorId: 1,
          creditorName: "CEDIS Norte",
          balance: 600,
          oldestDebtDate: "2026-09-01",
          openDebtCount: 2,
        },
        {
          creditorId: 2,
          creditorName: "CEDIS Sur",
          balance: 300,
          oldestDebtDate: "2026-09-03",
          openDebtCount: 1,
        },
      ],
    },
    {
      clientId: 11,
      clientName: "Cliente Contado",
      phone: null,
      accountingEntityId: null,
      saleTotal: 300,
      saldoTotal: 0,
      oldestDebtDate: null,
      cedisBalances: [],
      saleCedisBalances: [],
    },
  ],
};

const renderPanel = () => {
  const toast = vi.fn();
  render(<TripCollectionsPanel onSuccessToast={toast} />);
  return { toast };
};

describe("TripCollectionsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bulkPayload = null;
    mocks.useRoutes.mockReturnValue({ data: [{ id: 3, name: "Ruta Norte" }] });
    mocks.useTripCollections.mockReturnValue({
      data: [trip],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mocks.bulkMutate.mockImplementation(
      (
        payload: unknown,
        options: { onSuccess: (result: BulkPaymentResult) => void },
      ) => {
        mocks.bulkPayload = payload;
        options.onSuccess({
          created: 1,
          appliedTotal: 600,
          parkedTotal: 0,
          paymentIds: [1],
        });
      },
    );
  });

  it("expands a trip, excludes contado from bulk and sends trip attribution", async () => {
    const { toast } = renderPanel();

    fireEvent.click(screen.getByText("Chofer: Chofer Uno"));

    expect(screen.getByText("Cliente Crédito")).toBeInTheDocument();
    expect(screen.getAllByText("Contado").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Monto")).toHaveValue(900);
    expect(
      screen.getByRole("button", { name: "Registrar cobros (1)" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Registrar cobros (1)" }),
    );

    await waitFor(() => expect(mocks.bulkMutate).toHaveBeenCalledTimes(1));
    expect(mocks.bulkPayload).toEqual([
      {
        payerId: 88,
        receiverId: 1,
        amount: 900,
        paymentDate: toLocalDateString(new Date()),
        paymentMethod: "CASH",
        tripId: 7,
      },
    ]);
    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining("Se registraron 1 cobros"),
    );
    expect(screen.getByText(/Se registraron 1 cobros/)).toBeInTheDocument();
  });

  it("changes the prefilled amount when another CEDIS is selected", () => {
    renderPanel();
    fireEvent.click(screen.getByText("Chofer: Chofer Uno"));

    fireEvent.change(screen.getByLabelText("CEDIS"), {
      target: { value: "2" },
    });

    expect(screen.getByLabelText("Monto")).toHaveValue(900);
  });

  it("prints the trip collection sheet", () => {
    renderPanel();
    fireEvent.click(screen.getByText("Chofer: Chofer Uno"));
    fireEvent.click(screen.getByText("Imprimir hoja"));

    expect(openCollectionsSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        routeName: "Ruta Norte · Chofer Uno",
        businessUnitName: "Huevo",
        totalRuta: 900,
        rows: expect.arrayContaining([
          expect.objectContaining({
            displayName: "Cliente Crédito",
            entityType: "Cliente",
            saldoRuta: 900,
            saldoTotal: 500,
          }),
          expect.objectContaining({
            displayName: "Cliente Contado",
            entityType: "CASH",
            saldoRuta: 0,
            saldoTotal: 300,
          }),
        ]),
      }),
    );
  });

  it("saves a single row with the trip id", async () => {
    mocks.rowMutate.mockImplementation(
      (
        payload: unknown,
        options: {
          onSuccess: (payment: {
            id: number;
            amount: number;
            appliedAmount: number;
            remainingAmount: number;
            paymentDate: string;
            paymentMethod: string;
            status: string;
            createdAt: string;
          }) => void;
        },
      ) => {
        mocks.bulkPayload = payload;
        options.onSuccess({
          id: 1,
          amount: 900,
          appliedAmount: 600,
          remainingAmount: 300,
          paymentDate: toLocalDateString(new Date()),
          paymentMethod: "CASH",
          status: "ACTIVE",
          createdAt: "2026-09-01T10:00:00",
        });
      },
    );
    renderPanel();
    fireEvent.click(screen.getByText("Chofer: Chofer Uno"));
    fireEvent.click(screen.getByRole("button", { name: "Cobrar" }));

    await waitFor(() => expect(mocks.rowMutate).toHaveBeenCalledTimes(1));
    expect(mocks.bulkPayload).toMatchObject({
      payerId: 88,
      receiverId: 1,
      amount: 900,
      tripId: 7,
    });
  });
});
