import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SalesAnalyticsContent from "../components/SalesAnalyticsContent";
import type { SalesAnalyticsDTO } from "../types";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  const { MockResponsiveContainer } = await import("@/test/rechartsMock");
  return { ...actual, ResponsiveContainer: MockResponsiveContainer };
});

const branches = [
  { id: 1, name: "Roneli" },
  { id: 2, name: "Saban" },
  { id: 3, name: "Esperanza" },
];

vi.mock("@/features/branches/branch/branch.queries", () => ({
  useBranches: vi.fn(() => ({ data: branches, isLoading: false })),
}));

const analyticsData: SalesAnalyticsDTO = {
  startDate: "2026-08-01",
  endDate: "2026-08-01",
  dailySales: [
    {
      date: "2026-08-01",
      chickenByBranch: { Roneli: 130 },
      eggsByBranch: {},
      totalChicken: 130,
      totalEggs: 0,
    },
  ],
  weeklySummary: [],
  branchGrowth: [],
  summary: {
    totalChicken: 130,
    totalEggs: 0,
    chickenGrowth: 0,
    eggsGrowth: 0,
    avgDailyChicken: 130,
    avgDailyEggs: 0,
    daysInRange: 1,
  },
};

vi.mock("../api/salesAnalytics.queries", () => ({
  useSalesAnalytics: vi.fn(() => ({
    data: analyticsData,
    isLoading: false,
    refetch: vi.fn(),
  })),
}));

describe("SalesAnalyticsContent - branch selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-selects all branches when they first load", () => {
    render(<SalesAnalyticsContent />);

    expect(
      screen
        .getAllByText("Roneli")
        .some((el) => el.closest('[data-testid="flowbite-badge"]')),
    ).toBe(true);
    expect(
      screen
        .getAllByText("Saban")
        .some((el) => el.closest('[data-testid="flowbite-badge"]')),
    ).toBe(true);
    expect(
      screen
        .getAllByText("Esperanza")
        .some((el) => el.closest('[data-testid="flowbite-badge"]')),
    ).toBe(true);
  });

  it("keeps all branches deselected after unselecting via select all", () => {
    render(<SalesAnalyticsContent />);

    fireEvent.click(screen.getByText("Seleccionar sucursales"));
    fireEvent.click(screen.getByText("Seleccionar todas"));

    expect(screen.getByText("Ninguna seleccionada")).toBeInTheDocument();
    expect(
      screen
        .queryAllByText("Saban")
        .some((el) => el.closest('[data-testid="flowbite-badge"]')),
    ).toBe(false);
  });
});
