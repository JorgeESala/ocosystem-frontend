import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DiagnosticsPage from "../pages/DiagnosticsPage";

const { diagnosticItem } = vi.hoisted(() => ({
  diagnosticItem: {
    id: 5,
    branchId: 1,
    branchName: "Express FCP",
    level: "ERROR",
    event: "missing_categories",
    message: "Reporte sin categorías obligatorias",
    context: { missing: ["merma"], uncategorized: ["MERMA X"] },
    appVersion: "1.5.3",
    occurredAt: "2026-09-24T10:00:00",
    lastSeenAt: "2026-09-24T10:05:00",
    occurrences: 2,
    receivedAt: "2026-09-24T10:00:01",
  },
}));

vi.mock("../api/diagnostics.queries", () => ({
  useDiagnostics: vi.fn(() => ({
    data: { content: [diagnosticItem], page: 0, size: 20, totalElements: 1 },
    isLoading: false,
    isError: false,
    isFetching: false,
  })),
  useDiagnosticDetail: vi.fn(() => ({
    data: { ...diagnosticItem, stacktrace: "Trace line" },
    isLoading: false,
  })),
}));

vi.mock("@/features/branches/branch/branch.queries", () => ({
  useBranches: vi.fn(() => ({ data: [{ id: 1, name: "Express FCP" }] })),
}));

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DiagnosticsPage />
    </QueryClientProvider>,
  );

describe("DiagnosticsPage", () => {
  it("renders the diagnostics table", () => {
    renderPage();

    expect(screen.getByText("Diagnóstico")).toBeTruthy();
    expect(screen.getByText("missing_categories")).toBeTruthy();
    expect(screen.getByText("Reporte sin categorías obligatorias")).toBeTruthy();
    expect(screen.getAllByText("Express FCP").length).toBeGreaterThan(0);
    expect(screen.getByText("Buscar")).toBeTruthy();
  });

  it("opens the detail modal with context and stacktrace", async () => {
    renderPage();

    fireEvent.click(screen.getByText("missing_categories"));

    await waitFor(() => expect(screen.getByText("Trace line")).toBeTruthy());
    expect(screen.getByText(/merma/)).toBeTruthy();
  });
});
