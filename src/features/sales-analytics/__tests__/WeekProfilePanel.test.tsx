import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { cloneElement } from "react";
import type { ReactNode } from "react";
import { WeekProfilePanel } from "../components/WeekProfilePanel";
import type { DailySalesDTO } from "../types";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">
        {cloneElement(
          children as React.ReactElement<{ width?: number; height?: number }>,
          { width: 600, height: 300 },
        )}
      </div>
    ),
  };
});

const branches = [
  { id: 1, name: "Roneli" },
  { id: 2, name: "Saban" },
];

const day = (
  date: string,
  chickenByBranch: Record<string, number> = {},
  eggsByBranch: Record<string, number> = {},
): DailySalesDTO => ({
  date,
  chickenByBranch,
  eggsByBranch,
  totalChicken: 0,
  totalEggs: 0,
});

const roneliTwoWeeks = [
  day("2026-07-20", { Roneli: 100 }),
  day("2026-07-21", { Roneli: 110 }),
  day("2026-07-27", { Roneli: 130 }),
  day("2026-08-01", { Roneli: 140 }),
];

const bothBranches = [
  day("2026-07-20", { Roneli: 100, Saban: 50 }),
  day("2026-07-21", { Roneli: 110, Saban: 60 }),
  day("2026-07-27", { Roneli: 130, Saban: 70 }),
  day("2026-08-01", { Roneli: 140, Saban: 80 }),
];

describe("WeekProfilePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a KPI chip per selected branch with like-for-like change", () => {
    render(
      <WeekProfilePanel
        dailySales={roneliTwoWeeks}
        activeProduct="chicken"
        branches={branches}
        selectedBranchIds={[1]}
      />,
    );

    const chip = screen.getByTestId("week-total-Roneli");
    expect(chip).toHaveTextContent("270");
    expect(chip).toHaveTextContent("(hasta hoy)");
    expect(chip).toHaveTextContent("+28.6% vs misma sem. anterior");
    expect(chip).toHaveTextContent("(210)");
  });

  it("omits the partial-week marker when the range ends on Sunday", () => {
    const fullWeeks = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 110 }),
      day("2026-07-22", { Roneli: 120 }),
      day("2026-07-23", { Roneli: 130 }),
      day("2026-07-24", { Roneli: 140 }),
      day("2026-07-25", { Roneli: 150 }),
      day("2026-07-26", { Roneli: 160 }),
      day("2026-07-27", { Roneli: 170 }),
      day("2026-07-28", { Roneli: 180 }),
      day("2026-07-29", { Roneli: 190 }),
      day("2026-07-30", { Roneli: 200 }),
      day("2026-07-31", { Roneli: 210 }),
      day("2026-08-01", { Roneli: 220 }),
      day("2026-08-02", { Roneli: 230 }),
    ];

    render(
      <WeekProfilePanel
        dailySales={fullWeeks}
        activeProduct="chicken"
        branches={branches}
        selectedBranchIds={[1]}
      />,
    );

    const chip = screen.getByTestId("week-total-Roneli");
    expect(chip).toHaveTextContent("1400");
    expect(chip).not.toHaveTextContent("hasta hoy");
    expect(chip).toHaveTextContent("+53.8% vs misma sem. anterior");
    expect(chip).toHaveTextContent("(910)");
  });

  it("renders a chart with Monday-to-Sunday axis", () => {
    render(
      <WeekProfilePanel
        dailySales={roneliTwoWeeks}
        activeProduct="chicken"
        branches={branches}
        selectedBranchIds={[1]}
      />,
    );

    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Dom")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("shows a no-change marker when there is no previous week", () => {
    render(
      <WeekProfilePanel
        dailySales={[day("2026-07-20", { Roneli: 100 })]}
        activeProduct="chicken"
        branches={branches}
        selectedBranchIds={[1]}
      />,
    );

    const chip = screen.getByTestId("week-total-Roneli");
    expect(chip).toHaveTextContent("100");
    expect(chip).toHaveTextContent("—");
  });

  it("filters lines and chips by the selected branches", () => {
    render(
      <WeekProfilePanel
        dailySales={bothBranches}
        activeProduct="chicken"
        branches={branches}
        selectedBranchIds={[1]}
      />,
    );

    expect(screen.getByTestId("week-total-Roneli")).toBeInTheDocument();
    expect(screen.queryByTestId("week-total-Saban")).not.toBeInTheDocument();
  });

  it("shows an empty state when no branch is selected", () => {
    render(
      <WeekProfilePanel
        dailySales={roneliTwoWeeks}
        activeProduct="chicken"
        branches={branches}
        selectedBranchIds={[]}
      />,
    );

    expect(
      screen.getByText("Selecciona al menos una sucursal"),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there is no data", () => {
    render(
      <WeekProfilePanel
        dailySales={[]}
        activeProduct="chicken"
        branches={branches}
        selectedBranchIds={[1]}
      />,
    );

    expect(
      screen.getByText("Sin datos para el periodo seleccionado"),
    ).toBeInTheDocument();
  });

  it("uses the eggs source when activeProduct is eggs", () => {
    const eggData = [
      day("2026-07-20", {}, { Roneli: 10 }),
      day("2026-07-21", {}, { Roneli: 12 }),
      day("2026-07-27", {}, { Roneli: 15 }),
    ];

    render(
      <WeekProfilePanel
        dailySales={eggData}
        activeProduct="eggs"
        branches={branches}
        selectedBranchIds={[1]}
      />,
    );

    const chip = screen.getByTestId("week-total-Roneli");
    expect(chip).toHaveTextContent("15");
  });

  it("renders the chart inside the panel", () => {
    render(
      <WeekProfilePanel
        dailySales={roneliTwoWeeks}
        activeProduct="chicken"
        branches={branches}
        selectedBranchIds={[1]}
      />,
    );

    const panel = screen
      .getByText("Comparación semanal")
      .closest(".rounded-xl");
    expect(panel).not.toBeNull();
    expect(
      within(panel as HTMLElement).getByTestId("responsive-container"),
    ).toBeInTheDocument();
  });
});
