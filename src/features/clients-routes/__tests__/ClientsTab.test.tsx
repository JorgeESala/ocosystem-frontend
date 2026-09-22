import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ClientsTab } from "../components/ClientsTab";
import { toLocalDateString, formatHumanDate } from "@/utils/date.utils";

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toLocalDateString(date);
};

const mocks = vi.hoisted(() => ({
  useClients: vi.fn(),
  useDeleteClient: vi.fn(),
  useReactivateClient: vi.fn(),
  useClientPurchases: vi.fn(),
  useRoutes: vi.fn(),
  useLocalities: vi.fn(),
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: mocks.useClients,
  useClient: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateClient: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useCreateInternalClient: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateClient: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteClient: mocks.useDeleteClient,
  useReactivateClient: mocks.useReactivateClient,
  useClientPurchases: mocks.useClientPurchases,
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: mocks.useRoutes,
  useRoute: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useReactivateRoute: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useRoutePerformance: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("@/core/locality/api/locality.queries", () => ({
  useLocalities: mocks.useLocalities,
}));

vi.mock("../components/ClientDetailDrawer", () => ({
  ClientDetailDrawer: ({ client }: { client: { name: string } | null }) =>
    client ? (
      <div data-testid="client-detail">detalle {client.name}</div>
    ) : null,
}));

const activeClient = {
  id: 1,
  name: "Abarrotes Don Pepe",
  businessName: "Don Pepe",
  localityId: 1,
  localityName: "Centro",
  isInternalBranch: false,
  isInternalClient: false,
  active: true,
  lastPurchaseDate: daysAgo(3),
};

const olderClient = {
  id: 4,
  name: "Cliente Viejo",
  businessName: null,
  localityId: 1,
  localityName: "Centro",
  isInternalBranch: false,
  isInternalClient: false,
  active: true,
  lastPurchaseDate: daysAgo(60),
};

const inactiveClient = {
  id: 2,
  name: "Tienda Norte",
  businessName: null,
  localityId: 2,
  localityName: "Norte",
  isInternalBranch: false,
  isInternalClient: false,
  active: false,
};

describe("ClientsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useClients.mockImplementation((includeInactive = false) => ({
      data: includeInactive ? [activeClient, inactiveClient] : [activeClient],
      isLoading: false,
      isError: false,
      error: null,
    }));
    mocks.useDeleteClient.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useReactivateClient.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useRoutes.mockReturnValue({
      data: [
        {
          id: 1,
          name: "Ruta Centro",
          active: true,
          localityIds: [1],
          deliveryDays: [1],
        },
      ],
      isLoading: false,
    });
    mocks.useLocalities.mockReturnValue({
      data: [
        { id: 1, name: "Centro", active: true },
        { id: 2, name: "Norte", active: true },
      ],
      isLoading: false,
    });
    mocks.useClientPurchases.mockReturnValue({
      data: {
        clientId: 1,
        totalSales: 0,
        totalQuantity: 0,
        saleCount: 0,
        firstPurchase: null,
        lastPurchase: null,
        sales: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("muestra la ruta derivada de la localidad del cliente", () => {
    render(<ClientsTab unitType="EGG" />);

    expect(screen.getByText("Abarrotes Don Pepe")).toBeInTheDocument();
    expect(
      within(screen.getByRole("table")).getByText("Ruta Centro"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("¿Cómo se asigna la ruta?"),
    ).toBeInTheDocument();
  });

  it("busca clientes por nombre", () => {
    render(<ClientsTab unitType="EGG" />);

    fireEvent.change(screen.getByPlaceholderText("Buscar cliente"), {
      target: { value: "pepe" },
    });

    expect(screen.getByText("Abarrotes Don Pepe")).toBeInTheDocument();
  });

  it("filtra clientes sin ruta", () => {
    mocks.useClients.mockReturnValue({
      data: [
        activeClient,
        {
          id: 3,
          name: "Cliente Sin Ruta",
          businessName: null,
          localityId: null,
          localityName: null,
          isInternalBranch: false,
          isInternalClient: false,
          active: true,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ClientsTab unitType="EGG" />);

    fireEvent.change(screen.getByLabelText("Filtrar por ruta"), {
      target: { value: "none" },
    });

    expect(screen.getByText("Cliente Sin Ruta")).toBeInTheDocument();
    expect(screen.queryByText("Abarrotes Don Pepe")).not.toBeInTheDocument();
  });

  it("muestra inactivos y reactiva un cliente", async () => {
    const reactivate = vi.fn().mockResolvedValue({});
    mocks.useReactivateClient.mockReturnValue({
      mutateAsync: reactivate,
      isPending: false,
    });

    render(<ClientsTab unitType="EGG" />);

    fireEvent.click(screen.getByLabelText("Mostrar inactivos"));

    expect(await screen.findByText("Tienda Norte")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reactivar" }));

    await waitFor(() => expect(reactivate).toHaveBeenCalledWith(2));
  });

  it("muestra la última compra del cliente en formato corto", () => {
    render(<ClientsTab unitType="EGG" />);

    expect(
      within(screen.getByRole("table")).getByText(
        formatHumanDate(daysAgo(3), "short"),
      ),
    ).toBeInTheDocument();
  });

  it("filtra clientes dormidos por días sin compra", () => {
    mocks.useClients.mockReturnValue({
      data: [activeClient, olderClient],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ClientsTab unitType="EGG" />);

    fireEvent.change(screen.getByLabelText("Última compra"), {
      target: { value: "30" },
    });

    expect(screen.getByText("Cliente Viejo")).toBeInTheDocument();
    expect(screen.queryByText("Abarrotes Don Pepe")).not.toBeInTheDocument();
  });

  it("aplica el filtro inicial de ruta recibido", () => {
    mocks.useClients.mockReturnValue({
      data: [
        activeClient,
        {
          id: 3,
          name: "Cliente Sin Ruta",
          businessName: null,
          localityId: null,
          localityName: null,
          isInternalBranch: false,
          isInternalClient: false,
          active: true,
          lastPurchaseDate: null,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ClientsTab unitType="EGG" initialRouteFilter="none" />);

    expect(screen.getByText("Cliente Sin Ruta")).toBeInTheDocument();
    expect(screen.queryByText("Abarrotes Don Pepe")).not.toBeInTheDocument();
  });

  it("filtra por tipo de cliente", () => {
    mocks.useClients.mockReturnValue({
      data: [
        activeClient,
        {
          id: 7,
          name: "Cliente Interno",
          businessName: null,
          localityId: 1,
          localityName: "Centro",
          isInternalBranch: false,
          isInternalClient: true,
          active: true,
          lastPurchaseDate: null,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ClientsTab unitType="EGG" />);

    fireEvent.change(screen.getByLabelText("Tipo de cliente"), {
      target: { value: "internal" },
    });

    expect(screen.getByText("Cliente Interno")).toBeInTheDocument();
    expect(screen.queryByText("Abarrotes Don Pepe")).not.toBeInTheDocument();
  });

  it("ordena por última compra", () => {
    mocks.useClients.mockReturnValue({
      data: [activeClient, olderClient],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ClientsTab unitType="EGG" />);

    fireEvent.click(screen.getByRole("button", { name: /Última compra/ }));

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(within(rows[1]).getByText("Cliente Viejo")).toBeInTheDocument();
  });

  it("muestra primeros pasos cuando no hay clientes ni rutas", () => {
    mocks.useClients.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.useRoutes.mockReturnValue({ data: [], isLoading: false });

    render(
      <MemoryRouter initialEntries={["/business/huevo/clients-routes"]}>
        <ClientsTab unitType="EGG" />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("clients-onboarding")).toBeInTheDocument();
    expect(screen.getByText("Primeros pasos")).toBeInTheDocument();
  });

  it("abre el detalle al hacer clic y edita con el lápiz", () => {
    render(<ClientsTab unitType="EGG" />);

    fireEvent.click(screen.getByText("Abarrotes Don Pepe"));
    expect(screen.getByTestId("client-detail")).toHaveTextContent(
      "Abarrotes Don Pepe",
    );

    fireEvent.click(screen.getByTitle("Editar"));
    expect(screen.getByText("Editar cliente")).toBeInTheDocument();
  });

  it("abre el historial de compras del cliente", async () => {
    render(<ClientsTab unitType="EGG" />);

    fireEvent.click(screen.getByTitle("Historial"));

    expect(await screen.findByText("Historial de compras")).toBeInTheDocument();
  });
});
