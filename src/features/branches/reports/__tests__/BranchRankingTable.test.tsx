import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BranchRankingTable } from "../components/BranchRankingTable";
import type { BranchRankingRow } from "../utils/consolidatedMetrics";

const row = (
  branchId: number,
  branchName: string,
  overrides: Partial<BranchRankingRow> = {},
): BranchRankingRow => ({
  branchId,
  branchName,
  totalSales: 1000,
  totalTickets: 10,
  realTickets: 8,
  avgTicket: 125,
  totalSlaughtered: 20,
  mermaQuantity: 1.5,
  totalChickenTickets: 6,
  ticketsWithComplements: 3,
  attachRate: 50,
  daysWithReport: 7,
  share: 60,
  salesDelta: 10,
  missingDays: 0,
  expectedKg: null,
  expectedReportedKg: null,
  expectedVariancePct: null,
  ...overrides,
});

const defaultSort = { key: "totalSales", direction: "desc" } as const;

describe("BranchRankingTable", () => {
  it("renders branch rows with coverage", () => {
    render(
      <BranchRankingTable
        rows={[
          row(1, "Sucursal Centro"),
          row(2, "Sucursal Norte", { daysWithReport: 4, missingDays: 3 }),
        ]}
        expectedDays={7}
        onSelectBranch={vi.fn()}
        sort={defaultSort}
        onSortChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Sucursal Centro")).toBeTruthy();
    expect(screen.getByText("Sucursal Norte")).toBeTruthy();
    expect(screen.getByText("4/7 días")).toBeTruthy();
  });

  it("calls onSelectBranch when a row is clicked", () => {
    const onSelectBranch = vi.fn();
    render(
      <BranchRankingTable
        rows={[row(7, "Sucursal Centro")]}
        expectedDays={7}
        onSelectBranch={onSelectBranch}
        sort={defaultSort}
        onSortChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Sucursal Centro"));

    expect(onSelectBranch).toHaveBeenCalledWith(7, "Sucursal Centro");
  });

  it("notifies sort changes when a sortable header is clicked", () => {
    const onSortChange = vi.fn();
    render(
      <BranchRankingTable
        rows={[row(1, "Sucursal Centro")]}
        expectedDays={7}
        onSelectBranch={vi.fn()}
        sort={defaultSort}
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByText(/Ticket promedio/));

    expect(onSortChange).toHaveBeenCalledWith({
      key: "avgTicket",
      direction: "desc",
    });
  });

  it("sorts by the expected sales variance", () => {
    const onSortChange = vi.fn();
    render(
      <BranchRankingTable
        rows={[row(1, "Sucursal Centro")]}
        expectedDays={7}
        onSelectBranch={vi.fn()}
        sort={defaultSort}
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getAllByText(/Kg vendidos \/ esperados/)[0]);

    expect(onSortChange).toHaveBeenCalledWith({
      key: "expectedVariancePct",
      direction: "desc",
    });
  });

  it("shows the reported and expected kg for a branch", () => {
    render(
      <BranchRankingTable
        rows={[
          row(1, "Sucursal Centro", {
            expectedKg: 1000,
            expectedReportedKg: 1050,
            expectedVariancePct: 5,
          }),
        ]}
        expectedDays={7}
        onSelectBranch={vi.fn()}
        sort={defaultSort}
        onSortChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/1,050/)).toBeTruthy();
    expect(screen.getByText("+5.0%")).toBeTruthy();
  });
});
