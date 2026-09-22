import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClientFormModal } from "../components/ClientFormModal";

const mocks = vi.hoisted(() => ({
  useClient: vi.fn(),
  useCreateClient: vi.fn(),
  useCreateInternalClient: vi.fn(),
  useUpdateClient: vi.fn(),
  useLocalities: vi.fn(),
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClient: mocks.useClient,
  useCreateClient: mocks.useCreateClient,
  useCreateInternalClient: mocks.useCreateInternalClient,
  useUpdateClient: mocks.useUpdateClient,
}));

vi.mock("@/core/locality/api/locality.queries", () => ({
  useLocalities: mocks.useLocalities,
}));

describe("ClientFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useClient.mockReturnValue({ data: undefined, isLoading: false });
    mocks.useCreateClient.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useCreateInternalClient.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useUpdateClient.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useLocalities.mockReturnValue({
      data: [{ id: 1, name: "Centro", active: true }],
      isLoading: false,
    });
  });

  it("envía teléfono y dirección al crear", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mocks.useCreateClient.mockReturnValue({ mutateAsync, isPending: false });

    render(
      <ClientFormModal
        show
        clientIdToEdit={null}
        initialLocalityId={1}
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Nombre del cliente"), {
      target: { value: "Abarrotes Don Pepe" },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/), {
      target: { value: "811-123-4567" },
    });
    fireEvent.change(screen.getByLabelText(/Dirección/), {
      target: { value: "Av. Reforma 100" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        name: "Abarrotes Don Pepe",
        localityId: 1,
        businessName: null,
        phone: "811-123-4567",
        address: "Av. Reforma 100",
        isInternalBranch: false,
        isInternalClient: false,
      }),
    );
  });

  it("precarga teléfono y dirección al editar", () => {
    mocks.useClient.mockReturnValue({
      data: {
        id: 4,
        name: "Cliente",
        businessName: null,
        localityId: 1,
        phone: "555-0000",
        address: "Calle 1",
      },
      isLoading: false,
    });

    render(<ClientFormModal show clientIdToEdit={4} onClose={vi.fn()} />);

    expect(screen.getByLabelText(/Teléfono/)).toHaveValue("555-0000");
    expect(screen.getByLabelText(/Dirección/)).toHaveValue("Calle 1");
  });
});
