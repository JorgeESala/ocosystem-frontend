import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { BranchRankingTable } from "../components/BranchRankingTable";
import type { RankingSort } from "../components/BranchRankingTable";
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
  expectedLoaded: true,
  salesWithoutWeight: 0,
  salesWithoutReportedKg: 0,
  ...overrides,
});

const defaultSort = { key: "totalSales", direction: "desc" } as const;

const table = () => within(screen.getByTestId("ranking-table"));
const cards = () => within(screen.getByTestId("ranking-cards"));

const renderTable = (
  rows: BranchRankingRow[] = [row(1, "Sucursal Centro")],
  overrides: {
    sort?: RankingSort;
    onSortChange?: (sort: RankingSort) => void;
    onSelectBranch?: (branchId: number, branchName: string) => void;
  } = {},
) =>
  render(
    <BranchRankingTable
      rows={rows}
      expectedDays={7}
      onSelectBranch={overrides.onSelectBranch ?? vi.fn()}
      sort={overrides.sort ?? defaultSort}
      onSortChange={overrides.onSortChange ?? vi.fn()}
    />,
  );

describe("BranchRankingTable", () => {
  it("renders branch rows, coverage and the new column labels", () => {
    renderTable([
      row(1, "Sucursal Centro"),
      row(2, "Sucursal Norte", { daysWithReport: 4, missingDays: 3 }),
    ]);

    expect(table().getByText("Sucursal Centro")).toBeTruthy();
    expect(table().getByText("Sucursal Norte")).toBeTruthy();
    expect(table().getByText("4/7 días")).toBeTruthy();
    expect(table().getByText(/Pollo benef\. \(pzas\)/)).toBeTruthy();
    expect(table().getByText(/Cumplimiento kg/)).toBeTruthy();
    expect(table().getByText(/Merma total \(kg\)/)).toBeTruthy();
  });

  it("calls onSelectBranch when a table row is clicked", () => {
    const onSelectBranch = vi.fn();
    renderTable([row(7, "Sucursal Centro")], { onSelectBranch });

    fireEvent.click(table().getByText("Sucursal Centro"));

    expect(onSelectBranch).toHaveBeenCalledWith(7, "Sucursal Centro");
  });

  it("notifies sort changes when a sortable header is clicked", () => {
    const onSortChange = vi.fn();
    renderTable([row(1, "Sucursal Centro")], { onSortChange });

    fireEvent.click(table().getByText(/Ticket promedio/));

    expect(onSortChange).toHaveBeenCalledWith({
      key: "avgTicket",
      direction: "desc",
    });
  });

  it("notifies sort changes for the remaining sortable headers", () => {
    const onSortChange = vi.fn();
    renderTable([row(1, "Sucursal Centro")], { onSortChange });

    fireEvent.click(table().getByText(/Venta real/));
    expect(onSortChange).toHaveBeenCalledWith({
      key: "totalSales",
      direction: "asc",
    });

    fireEvent.click(table().getByText(/Pollo benef\. \(pzas\)/));
    expect(onSortChange).toHaveBeenCalledWith({
      key: "totalSlaughtered",
      direction: "desc",
    });

    fireEvent.click(table().getByText(/Merma total \(kg\)/));
    expect(onSortChange).toHaveBeenCalledWith({
      key: "mermaQuantity",
      direction: "desc",
    });

    fireEvent.click(table().getByText(/Cobertura/));
    expect(onSortChange).toHaveBeenCalledWith({
      key: "daysWithReport",
      direction: "desc",
    });
  });

  it("opens the branch detail with the keyboard", () => {
    const onSelectBranch = vi.fn();
    renderTable([row(5, "Sucursal Poniente")], { onSelectBranch });

    const rowElement = table().getByText("Sucursal Poniente").closest("tr");
    expect(rowElement).not.toBeNull();

    fireEvent.keyDown(rowElement as HTMLTableRowElement, { key: "Enter" });
    expect(onSelectBranch).toHaveBeenCalledWith(5, "Sucursal Poniente");

    fireEvent.keyDown(rowElement as HTMLTableRowElement, { key: " " });
    expect(onSelectBranch).toHaveBeenCalledTimes(2);
  });

  it("sorts by the expected sales compliance", () => {
    const onSortChange = vi.fn();
    renderTable([row(1, "Sucursal Centro")], { onSortChange });

    fireEvent.click(table().getByText(/Cumplimiento kg/));

    expect(onSortChange).toHaveBeenCalledWith({
      key: "expectedVariancePct",
      direction: "desc",
    });
  });

  it("shows the reported and expected kg for a branch", () => {
    renderTable([
      row(1, "Sucursal Centro", {
        expectedKg: 1000,
        expectedReportedKg: 1050,
        expectedVariancePct: 5,
      }),
    ]);

    expect(table().getByText(/1,050 vendidos/)).toBeTruthy();
    expect(table().getByText(/1,000 esperados/)).toBeTruthy();
    expect(table().getByText("105.0%")).toBeTruthy();
  });

  it("marks a branch for review when days are missing", () => {
    renderTable([
      row(1, "Sucursal Centro", { daysWithReport: 4, missingDays: 3 }),
    ]);

    expect(table().getByText("Revisar")).toBeTruthy();
  });

  it("marks a branch for review when the variance is high", () => {
    renderTable([
      row(1, "Sucursal Centro", {
        expectedKg: 1000,
        expectedReportedKg: 1150,
        expectedVariancePct: 15,
      }),
    ]);

    expect(table().getByText("Revisar")).toBeTruthy();
  });

  it("does not mark a healthy branch for review", () => {
    renderTable([
      row(1, "Sucursal Centro", {
        expectedKg: 1000,
        expectedReportedKg: 1020,
        expectedVariancePct: 2,
      }),
    ]);

    expect(table().queryByText("Revisar")).toBeNull();
  });

  it("shows a loading label instead of a review flag while expected data loads", () => {
    renderTable([row(1, "Sucursal Centro", { expectedLoaded: false })]);

    expect(table().getByText("Cargando kilos esperados")).toBeTruthy();
    expect(table().queryByText("Revisar")).toBeNull();
  });

  it("renders the branch cards for small screens", () => {
    renderTable([
      row(1, "Sucursal Centro", {
        expectedKg: 1000,
        expectedReportedKg: 1050,
        expectedVariancePct: 5,
      }),
    ]);

    expect(cards().getByText("Sucursal Centro")).toBeTruthy();
    expect(cards().getByText(/1,050 vendidos/)).toBeTruthy();
    expect(cards().getByText("7/7 días")).toBeTruthy();
  });

  it("opens the branch detail from a card", () => {
    const onSelectBranch = vi.fn();
    renderTable([row(3, "Sucursal Sur")], { onSelectBranch });

    fireEvent.click(cards().getByText("Sucursal Sur"));

    expect(onSelectBranch).toHaveBeenCalledWith(3, "Sucursal Sur");
  });

  it("opens the branch detail from a card with the keyboard", () => {
    const onSelectBranch = vi.fn();
    renderTable([row(4, "Sucursal Oriente")], { onSelectBranch });

    const card = cards().getByRole("button", {
      name: "Ver detalle de Sucursal Oriente",
    });
    fireEvent.keyDown(card, { key: "Enter" });

    expect(onSelectBranch).toHaveBeenCalledWith(4, "Sucursal Oriente");
  });

  it("changes the sort key and direction from the mobile controls", () => {
    const onSortChange = vi.fn();
    renderTable([row(1, "Sucursal Centro")], { onSortChange });

    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "expectedVariancePct" },
    });
    expect(onSortChange).toHaveBeenCalledWith({
      key: "expectedVariancePct",
      direction: "desc",
    });

    fireEvent.click(screen.getByText("Mayor a menor"));
    expect(onSortChange).toHaveBeenCalledWith({
      key: "totalSales",
      direction: "asc",
    });
  });

  it("toggles the mobile direction back from ascending", () => {
    const onSortChange = vi.fn();
    renderTable([row(1, "Sucursal Centro")], {
      onSortChange,
      sort: { key: "totalSales", direction: "asc" },
    });

    fireEvent.click(screen.getByText("Menor a mayor"));

    expect(onSortChange).toHaveBeenCalledWith({
      key: "totalSales",
      direction: "desc",
    });
  });
});
