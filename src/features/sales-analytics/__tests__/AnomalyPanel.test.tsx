import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { cloneElement } from "react";
import type { ReactNode } from "react";
import {
  AnomalyPanel,
  AnomalyTooltip,
  AnomalyHelpContent,
} from "../components/AnomalyPanel";
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

const spikeData = [
  day("2026-07-11", { Roneli: 100, Saban: 50 }),
  day("2026-07-18", { Roneli: 100, Saban: 50 }),
  day("2026-07-25", { Roneli: 100, Saban: 50 }),
  day("2026-08-01", { Roneli: 145, Saban: 50 }),
];

const calmData = [
  day("2026-07-11", { Roneli: 100 }),
  day("2026-07-18", { Roneli: 100 }),
  day("2026-07-25", { Roneli: 100 }),
  day("2026-08-01", { Roneli: 112 }),
];

const multiAnomalies = [
  day("2026-07-11", { Roneli: 100, Saban: 50 }),
  day("2026-07-18", { Roneli: 100, Saban: 50 }),
  day("2026-07-25", { Roneli: 100, Saban: 10 }),
  day("2026-08-01", { Roneli: 145, Saban: 50 }),
];

const shortHistory = [
  day("2026-07-11", { Roneli: 100 }),
  day("2026-07-18", { Roneli: 100 }),
  day("2026-07-25", { Roneli: 100 }),
];

describe("AnomalyPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders flagged anomalies with deviation and expected-to-actual", () => {
    render(<AnomalyPanel dailySales={spikeData} activeProduct="chicken" />);

    const row = screen.getByTestId("anomaly-Roneli");
    expect(row).toHaveTextContent("+45%");
    expect(row).toHaveTextContent("esperado 100");
    expect(row).toHaveTextContent("real 145");
    expect(screen.queryByTestId("anomaly-Saban")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no anomalies", () => {
    render(<AnomalyPanel dailySales={calmData} activeProduct="chicken" />);

    expect(screen.getByText("Sin anomalías en el periodo")).toBeInTheDocument();
  });

  it("shows an insufficient history state", () => {
    render(<AnomalyPanel dailySales={shortHistory} activeProduct="chicken" />);

    expect(
      screen.getByText("Historial insuficiente para detectar anomalías"),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there is no data", () => {
    render(<AnomalyPanel dailySales={[]} activeProduct="chicken" />);

    expect(screen.getByText("Sin anomalías en el periodo")).toBeInTheDocument();
  });

  it("defaults the threshold to 30%", () => {
    render(<AnomalyPanel dailySales={spikeData} activeProduct="chicken" />);

    expect(screen.getByLabelText("Umbral de anomalía")).toHaveValue("30");
  });

  it("hides anomalies below the adjusted threshold", () => {
    render(<AnomalyPanel dailySales={spikeData} activeProduct="chicken" />);

    fireEvent.change(screen.getByLabelText("Umbral de anomalía"), {
      target: { value: "50" },
    });

    expect(screen.queryByTestId("anomaly-Roneli")).not.toBeInTheDocument();
    expect(screen.getByText("Sin anomalías en el periodo")).toBeInTheDocument();
  });

  it("uses the eggs source when activeProduct is eggs", () => {
    const eggData = [
      day("2026-07-11", {}, { Roneli: 10 }),
      day("2026-07-18", {}, { Roneli: 10 }),
      day("2026-07-25", {}, { Roneli: 10 }),
      day("2026-08-01", {}, { Roneli: 16 }),
    ];

    render(<AnomalyPanel dailySales={eggData} activeProduct="eggs" />);

    const row = screen.getByTestId("anomaly-Roneli");
    expect(row).toHaveTextContent("+60%");
  });

  it("renders the chart inside the panel", () => {
    render(<AnomalyPanel dailySales={spikeData} activeProduct="chicken" />);

    const panel = screen
      .getByText("Anomalías de ventas")
      .closest(".rounded-xl");
    expect(panel).not.toBeNull();
    expect(
      within(panel as HTMLElement).getByTestId("responsive-container"),
    ).toBeInTheDocument();
  });

  it("switches to solo-lines mode hiding all dots but keeping the list", () => {
    const { container } = render(
      <AnomalyPanel dailySales={spikeData} activeProduct="chicken" />,
    );

    const toggle = screen.getByLabelText("Mostrar esperado y banda");
    expect(toggle).toBeChecked();
    expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);

    fireEvent.click(toggle);

    expect(toggle).not.toBeChecked();
    expect(container.querySelectorAll("circle").length).toBe(0);
    expect(screen.getByTestId("anomaly-Roneli")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("labels the y-axis with the product unit", () => {
    const mixedData = [
      day("2026-07-11", { Roneli: 100 }, { Roneli: 10 }),
      day("2026-07-18", { Roneli: 100 }, { Roneli: 10 }),
      day("2026-07-25", { Roneli: 100 }, { Roneli: 10 }),
      day("2026-08-01", { Roneli: 145 }, { Roneli: 16 }),
    ];

    const { rerender } = render(
      <AnomalyPanel dailySales={mixedData} activeProduct="chicken" />,
    );

    expect(screen.getByText("pollos")).toBeInTheDocument();

    rerender(<AnomalyPanel dailySales={mixedData} activeProduct="eggs" />);

    expect(screen.getByText("casilleros")).toBeInTheDocument();
  });

  it("shows the weekday name in the chart tooltip", () => {
    const { container } = render(
      <AnomalyTooltip
        active
        label="1 ago"
        payload={[
          {
            dataKey: "Roneli",
            value: 145,
            payload: {
              date: "2026-08-01",
              label: "1 ago",
              Roneli: 145,
              "Roneli.exp": 100,
            },
          },
        ]}
      />,
    );

    expect(container).toHaveTextContent("sáb 1 ago");
  });

  it("colors spikes green and dips red in the chart and the list", () => {
    const { container } = render(
      <AnomalyPanel dailySales={multiAnomalies} activeProduct="chicken" />,
    );

    const circles = Array.from(container.querySelectorAll("circle"));
    expect(
      circles.filter((c) => c.getAttribute("fill") === "#10b981").length,
    ).toBeGreaterThan(0);
    expect(
      circles.filter((c) => c.getAttribute("fill") === "#ef4444").length,
    ).toBeGreaterThan(0);
    expect(
      circles.filter((c) => c.getAttribute("fill") === "#9CA3AF").length,
    ).toBeGreaterThan(0);

    const spikePct = screen.getByText("+45%");
    const dipPct = screen.getByText("-80%");
    expect(spikePct.className).toContain("text-emerald-400");
    expect(dipPct.className).toContain("text-red-400");
  });

  it("explains how the expected value is calculated in the help content", () => {
    render(<AnomalyHelpContent />);

    expect(
      screen.getByText("¿Cómo se calcula el esperado?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/mediana de las ventas del mismo día/),
    ).toBeInTheDocument();
  });

  it("shows the help icon explaining what each line means", () => {
    render(<AnomalyPanel dailySales={spikeData} activeProduct="chicken" />);

    expect(
      screen.getByLabelText("¿Qué significa cada línea?"),
    ).toBeInTheDocument();
  });

  it("limits the anomaly list height and shows the count", () => {
    render(
      <AnomalyPanel dailySales={multiAnomalies} activeProduct="chicken" />,
    );

    expect(screen.getByText("2 anomalías")).toBeInTheDocument();

    const list = screen.getByTestId("anomaly-list");
    expect(list.className).toContain("max-h-72");
    expect(list.className).toContain("overflow-y-auto");
  });

  it("renders the chart above the anomaly list", () => {
    render(
      <AnomalyPanel dailySales={multiAnomalies} activeProduct="chicken" />,
    );

    const chart = screen.getByTestId("responsive-container");
    const list = screen.getByTestId("anomaly-list");

    expect(
      chart.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
