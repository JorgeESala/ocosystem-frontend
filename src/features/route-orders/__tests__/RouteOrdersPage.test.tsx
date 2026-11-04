import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RouteOrdersPage from "../pages/RouteOrdersPage";

const mocks = vi.hoisted(() => ({
  saveMutateAsync: vi.fn(),
  sheet: {
    date: "2030-01-07",
    route: { id: 1, name: "Ruta Centro" },
    localities: [],
    clients: [
      {
        id: 10,
        name: "Cliente A",
        businessName: "Abarrotes A",
        localityName: "Centro",
        lastSalePricePerCarton: null,
        lastSalePricePerKg: null,
      },
    ],
    order: {
      id: null,
      routeId: 1,
      orderDate: "2030-01-07",
      driverName: "",
      vehicleName: "",
      notes: "",
      lines: [],
    },
  },
}));

vi.mock("../api/routeOrders.queries", () => ({
  useRouteOrdersDay: () => ({
    data: [mocks.sheet],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  }),
  useEggPriceReference: () => ({
    data: {
      id: 1,
      pricePerCarton: 65,
      pricePerBox: 780,
      effectiveFrom: "2030-01-01",
      notes: null,
      createdBy: null,
      updatedBy: null,
      createdAt: null,
      updatedAt: null,
    },
    isLoading: false,
    isFetching: false,
  }),
  useSaveRouteOrder: () => ({
    mutateAsync: mocks.saveMutateAsync,
    isPending: false,
  }),
  useSaveEggPriceReference: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useEggPriceReferenceHistory: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: () => ({ data: [] }),
}));

vi.mock("flowbite-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("flowbite-react")>();
  return {
    ...actual,
    Datepicker: ({
      value,
      onChange,
    }: {
      value?: Date | null;
      onChange?: (date: Date | null) => void;
    }) => (
      <input
        data-testid="mock-datepicker"
        value={value ? value.toISOString().slice(0, 10) : ""}
        onChange={() => onChange?.(new Date("2030-01-07T00:00:00"))}
      />
    ),
  };
});

describe("RouteOrdersPage", () => {
  beforeEach(() => {
    mocks.saveMutateAsync.mockReset();
    mocks.saveMutateAsync.mockResolvedValue({
      id: 1,
      routeId: 1,
      orderDate: "2030-01-07",
      driverName: "",
      vehicleName: "",
      notes: "",
      lines: [],
    });
  });

  it("carga la ruta, calcula totales y guarda la hoja", async () => {
    render(<RouteOrdersPage unitType="EGG" />);

    expect(await screen.findByText("Cliente A")).toBeInTheDocument();
    expect(screen.getByText("Precio actual del huevo")).toBeInTheDocument();
    expect(screen.getAllByText("Total cajas").length).toBeGreaterThan(0);

    const quantityInput = screen
      .getAllByRole("spinbutton")
      .find((input) => input.getAttribute("step") === "0.001");
    expect(quantityInput).toBeDefined();
    fireEvent.change(quantityInput as HTMLElement, {
      target: { value: "18" },
    });

    await waitFor(() =>
      expect(screen.getAllByText("$1,170.00").length).toBeGreaterThan(0),
    );

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => expect(mocks.saveMutateAsync).toHaveBeenCalled());
    expect(mocks.saveMutateAsync.mock.calls[0][0]).toMatchObject({
      routeId: 1,
      orderDate: "2030-01-07",
      lines: [
        expect.objectContaining({
          clientId: 10,
          quantity: 18,
          unitPrice: 65,
        }),
      ],
    });
  });
});
