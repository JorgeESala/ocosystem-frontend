import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WasteDetailDrawer } from "../components/WasteDetailDrawer";
import type { WasteReportDTO } from "../api/wasteReport.api";

const { mockReport } = vi.hoisted(() => ({
  mockReport: {
    totals: {
      lossQuantity: 9.1,
      operationalQuantity: 175.9,
      totalQuantity: 185,
      totalValue: 950,
    },
    byProduct: [
      {
        productBarcode: "T",
        productName: "Tripa",
        tripa: true,
        quantity: 175.9,
        value: 900,
        branchBreakdown: [
          { branchId: 1, branchName: "Centro", quantity: 175.9, value: 900 },
        ],
      },
      {
        productBarcode: "P",
        productName: "Pierna",
        tripa: false,
        quantity: 9.1,
        value: 50,
        branchBreakdown: [
          { branchId: 1, branchName: "Centro", quantity: 9.1, value: 50 },
        ],
      },
    ],
    byBranch: [
      {
        branchId: 1,
        branchName: "Centro",
        lossQuantity: 9.1,
        tripaQuantity: 175.9,
        totalQuantity: 185,
        value: 950,
      },
    ],
  } as WasteReportDTO,
}));

vi.mock("../api/wasteReport.queries", () => ({
  useWasteReport: () => ({
    data: mockReport,
    isLoading: false,
    isError: false,
  }),
}));

const baseProps = {
  open: true,
  onClose: vi.fn(),
  branchIds: [1],
  dates: { start: new Date(2026, 5, 1), end: new Date(2026, 5, 7) },
  scopeLabel: "Todas las sucursales",
  onSelectProduct: vi.fn(),
};

describe("WasteDetailDrawer", () => {
  it("renders the split totals and both tables", () => {
    render(<WasteDetailDrawer {...baseProps} />);

    expect(screen.getByText("Merma total")).toBeTruthy();
    expect(screen.getByText("Tripa (operativa)")).toBeTruthy();
    expect(screen.getByText("Pérdida neta", { selector: "p" })).toBeTruthy();
    expect(screen.getByText("Centro")).toBeTruthy();
    expect(screen.getByText("Pierna")).toBeTruthy();
  });

  it("opens the product detail when a product row is clicked", () => {
    const onSelectProduct = vi.fn();
    render(
      <WasteDetailDrawer {...baseProps} onSelectProduct={onSelectProduct} />,
    );

    fireEvent.click(screen.getByText("Pierna"));

    expect(onSelectProduct).toHaveBeenCalledWith("P", "Pierna");
  });
});
