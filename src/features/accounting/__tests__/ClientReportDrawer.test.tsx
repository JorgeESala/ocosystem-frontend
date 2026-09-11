import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClientReportDrawer } from "../components/ClientReportDrawer";

const mocks = vi.hoisted(() => ({
  useClientStatementSummary: vi.fn(),
}));

vi.mock("@/features/accounting/api/client-summary.queries", () => ({
  useClientStatementSummary: mocks.useClientStatementSummary,
}));

vi.mock("@/features/accounting/api/accounting-entities.queries", () => ({
  useAccountingEntities: vi.fn(() => ({
    data: [
      { id: 2, name: "CEDIS Norte", entityType: "EGGCEDIS", entityId: 20 },
    ],
  })),
}));

const summary = {
  debtorEntityId: 3,
  from: "2026-09-01",
  to: "2026-09-30",
  openingBalance: 1000,
  totalCharges: 500,
  totalPayments: 200,
  closingBalance: 1300,
  movements: [
    {
      accountsPayableId: 11,
      creditorEntityId: 2,
      movementDate: "2026-09-05",
      movementType: "PAYMENT",
      balanceBefore: 1000,
      amount: 200,
      balanceAfter: 800,
      folio: "DEP-001",
      note: null,
    },
  ],
};

const renderDrawer = (onRangeChange = vi.fn(), onExportPdf = vi.fn()) => {
  render(
    <ClientReportDrawer
      open
      onClose={vi.fn()}
      debtorEntityId={3}
      debtorName="Deudor Uno"
      from="2026-09-01"
      to="2026-09-30"
      onRangeChange={onRangeChange}
      onExportPdf={onExportPdf}
    />,
  );
  return { onRangeChange, onExportPdf };
};

describe("ClientReportDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useClientStatementSummary.mockReturnValue({
      data: summary,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("shows the client-wide statement with summary and movements", () => {
    renderDrawer();

    expect(
      screen.getByText("Reporte del cliente · Deudor Uno"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Saldo inicial").length).toBeGreaterThan(0);
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getAllByText("Saldo final").length).toBeGreaterThan(0);
    expect(screen.getByText("$1,300.00")).toBeInTheDocument();
    expect(screen.getByText(/DEP-001/)).toBeInTheDocument();
    expect(screen.getByText("CEDIS Norte")).toBeInTheDocument();
  });

  it("changes the range with the month presets", () => {
    const { onRangeChange } = renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Mes pasado" }));

    expect(onRangeChange).toHaveBeenCalledTimes(1);
    expect(onRangeChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-01$/);
  });

  it("exports the monthly pdf with the debtor name", () => {
    const { onExportPdf } = renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Exportar PDF" }));

    expect(onExportPdf).toHaveBeenCalledTimes(1);
    expect(onExportPdf.mock.calls[0][0]).toMatchObject({
      debtorName: "Deudor Uno",
      openingBalance: 1000,
      closingBalance: 1300,
    });
  });
});
