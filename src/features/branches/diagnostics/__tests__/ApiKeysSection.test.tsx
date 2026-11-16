import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiKeysSection } from "../components/ApiKeysSection";

const createKey = vi.fn();
const revokeKey = vi.fn();

vi.mock("../api/api-keys.queries", () => ({
  useApiKeys: vi.fn(() => ({
    data: [
      {
        id: 1,
        branchId: 2,
        branchName: "Sucursal Dos",
        label: "PC caja",
        active: true,
        createdAt: "2026-06-09T10:00:00",
        lastUsedAt: null,
        lastAppVersion: "1.6.2",
      },
    ],
    isLoading: false,
    isError: false,
  })),
  useLatestVersion: vi.fn(() => ({
    data: { version: "1.6.3", mandatory: true },
  })),
  useCreateApiKey: vi.fn(() => ({ mutate: createKey, isPending: false })),
  useRevokeApiKey: vi.fn(() => ({ mutate: revokeKey, isPending: false })),
}));

vi.mock("@/features/branches/branch/branch.queries", () => ({
  useBranches: vi.fn(() => ({
    data: [{ id: 2, name: "Sucursal Dos" }],
  })),
}));

function renderSection() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ApiKeysSection />
    </QueryClientProvider>,
  );
}

describe("ApiKeysSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows api keys section with revoke action", () => {
    renderSection();

    expect(
      screen.getByText("Llaves de sucursal (app de reportes)"),
    ).toBeInTheDocument();
    expect(screen.getByText("PC caja")).toBeInTheDocument();
    expect(screen.getByText("Versión publicada: 1.6.3")).toBeInTheDocument();
    expect(screen.getByText("1.6.2")).toBeInTheDocument();
    expect(screen.getByText("Desactualizada")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Revocar/i }));
    expect(revokeKey).toHaveBeenCalledWith(1);
  });
});
