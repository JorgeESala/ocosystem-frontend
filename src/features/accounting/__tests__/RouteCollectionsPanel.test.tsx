import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouteCollectionsPanel } from "../components/RouteCollectionsPanel";
import { openCollectionsSheet } from "../utils/collectionsSheet";

const mocks = vi.hoisted(() => ({
  useRoutes: vi.fn(),
  useRouteCollections: vi.fn(),
  useOpenAccounts: vi.fn(),
  modalProps: [] as unknown[],
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: mocks.useRoutes,
}));

vi.mock("../api/collections.queries", () => ({
  collectionsKeys: { all: ["collections"] },
  useRouteCollections: mocks.useRouteCollections,
}));

vi.mock("../api/accounts-payable.queries", () => ({
  useOpenAccounts: mocks.useOpenAccounts,
}));

vi.mock("../utils/collectionsSheet", () => ({
  openCollectionsSheet: vi.fn(),
}));

vi.mock("../components/RegisterPaymentFirstModal", () => ({
  RegisterPaymentFirstModal: (props: Record<string, unknown>) => {
    mocks.modalProps.push(props);
    return props.open ? (
      <div
        data-testid="payment-modal"
        data-route={String(props.initialRouteId ?? "")}
        data-amount={String(props.initialAmount ?? "")}
      />
    ) : null;
  },
}));

const branchRow = {
  debtorEntityType: "BRANCH",
  debtorEntityId: 3,
  debtorDisplayName: "Express Chunhuhub",
  accountingEntityId: 77,
  saldoTotal: 620,
  saldoRuta: 500,
  phone: null,
  oldestDebtDateRuta: "2026-09-01",
};

const clientRow = {
  debtorEntityType: "EGGCLIENT",
  debtorEntityId: 235,
  debtorDisplayName: "Doña María",
  accountingEntityId: 88,
  saldoTotal: 300,
  saldoRuta: 300,
  phone: "811-000-1234",
  oldestDebtDateRuta: null,
};

const renderPanel = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouteCollectionsPanel
        creditorEntityType="EGGCEDIS"
        businessUnitName="Huevo"
      />
    </QueryClientProvider>,
  );
};

describe("RouteCollectionsPanel", () => {
  it("asks for a route before showing data", () => {
    mocks.useRoutes.mockReturnValue({ data: [{ id: 7, name: "Ruta Norte" }] });
    mocks.useRouteCollections.mockReturnValue({ data: [], isLoading: false });

    renderPanel();

    expect(
      screen.getByText(/Elige una ruta para ver los deudores/),
    ).toBeInTheDocument();
  });

  it("lists deudores sorted by route balance with the route total", () => {
    mocks.useRoutes.mockReturnValue({ data: [{ id: 7, name: "Ruta Norte" }] });
    mocks.useRouteCollections.mockReturnValue({
      data: [branchRow, clientRow],
      isLoading: false,
    });

    renderPanel();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "7" } });

    expect(screen.getByText("Express Chunhuhub")).toBeInTheDocument();
    expect(screen.getByText("Doña María")).toBeInTheDocument();
    expect(screen.getByText("811-000-1234")).toBeInTheDocument();
    expect(screen.getByText("Total a cobrar: $800.00")).toBeInTheDocument();
    expect(screen.getByText(/2 deudores/)).toBeInTheDocument();
  });

  it("opens the payment modal pre-filled with the route and route balance", async () => {
    mocks.useRoutes.mockReturnValue({ data: [{ id: 7, name: "Ruta Norte" }] });
    mocks.useRouteCollections.mockReturnValue({
      data: [branchRow],
      isLoading: false,
    });
    mocks.useOpenAccounts.mockReturnValue({ data: [], isLoading: false });

    renderPanel();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "7" } });
    fireEvent.click(screen.getByText("Cobrar"));

    await waitFor(() => {
      expect(screen.getByTestId("payment-modal")).toBeInTheDocument();
    });

    const modal = screen.getByTestId("payment-modal");
    expect(modal).toHaveAttribute("data-route", "7");
    expect(modal).toHaveAttribute("data-amount", "500");
    expect(mocks.useOpenAccounts).toHaveBeenCalledWith({
      debtorId: 77,
      creditorEntityType: "EGGCEDIS",
      status: "OPEN",
    });
  });

  it("prints the sheet with rows and route total", () => {
    mocks.useRoutes.mockReturnValue({ data: [{ id: 7, name: "Ruta Norte" }] });
    mocks.useRouteCollections.mockReturnValue({
      data: [branchRow, clientRow],
      isLoading: false,
    });

    renderPanel();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "7" } });
    fireEvent.click(screen.getByText("Imprimir hoja"));

    expect(openCollectionsSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        routeName: "Ruta Norte",
        businessUnitName: "Huevo",
        totalRuta: 800,
        rows: expect.arrayContaining([
          expect.objectContaining({
            displayName: "Express Chunhuhub",
            entityType: "BRANCH",
            saldoRuta: 500,
          }),
          expect.objectContaining({
            displayName: "Doña María",
            entityType: "EGGCLIENT",
            phone: "811-000-1234",
          }),
        ]),
      }),
    );
  });

  it("shows an error alert distinct from the empty state", () => {
    mocks.useRoutes.mockReturnValue({ data: [{ id: 7, name: "Ruta Norte" }] });
    mocks.useRouteCollections.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderPanel();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "7" } });

    expect(
      screen.getByText(/Error al cargar la cobranza de la ruta/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Sin deudores con saldo en esta ruta."),
    ).not.toBeInTheDocument();
  });

  it("shows the empty state for a route without debtors", () => {
    mocks.useRoutes.mockReturnValue({ data: [{ id: 7, name: "Ruta Norte" }] });
    mocks.useRouteCollections.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    renderPanel();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "7" } });

    expect(
      screen.getByText("Sin deudores con saldo en esta ruta."),
    ).toBeInTheDocument();
  });
});
