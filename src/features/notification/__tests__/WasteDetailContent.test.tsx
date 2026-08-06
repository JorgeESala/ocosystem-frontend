import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WasteDetailContent } from "../components/WasteDetailContent";

vi.mock("@/utils/moneyNumbers", () => ({
  formatMXN: vi.fn((n: number) => `$${n.toFixed(2)}`),
}));

const baseDetail = {
  batchId: 1,
  entryDate: "2026-01-15",
  provider: "Proveedor A",
  chickensReceived: 50,
  kgTotal: 100,
  chickensSold: 40,
  kgSold: 80,
  kgGut: 5,
  mermaConTripa: 350,
  mermaSinTripa: 300,
  thresholdWarning: 240,
  thresholdCritical: 300,
  sales: [
    { saleId: 100, saleDate: "2026-01-15", clientName: "Cliente A", employeeId: null, quantity: 10, kgTotal: 35, kgGut: 1.2, saleTotal: 500 },
    { saleId: 101, saleDate: "2026-01-15", clientName: "Cliente B", employeeId: 5, quantity: 20, kgTotal: 52, kgGut: 2.5, saleTotal: 1200 },
  ],
};

describe("WasteDetailContent", () => {
  it("renders info cards with correct values", () => {
    render(<WasteDetailContent detail={baseDetail} />);

    expect(screen.getByText("Fecha de entrada")).toBeInTheDocument();
    expect(screen.getAllByText("2026-01-15").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Proveedor")).toBeInTheDocument();
    expect(screen.getByText("Proveedor A")).toBeInTheDocument();
    expect(screen.getByText("Pollos recibidos")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Peso total")).toBeInTheDocument();
    expect(screen.getByText("100 kg")).toBeInTheDocument();
    expect(screen.getByText("Pollos vendidos")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("Peso vendido")).toBeInTheDocument();
    expect(screen.getByText("80 kg")).toBeInTheDocument();
    expect(screen.getByText("Peso tripas")).toBeInTheDocument();
    expect(screen.getByText("5 kg")).toBeInTheDocument();
  });

  it("renders merma section with values", () => {
    render(<WasteDetailContent detail={baseDetail} />);
    expect(screen.getByText("Indicadores de merma")).toBeInTheDocument();
    expect(screen.getAllByText("350 g/ave").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("300 g/ave")).toBeInTheDocument();
  });

  it("renders merma color as red when above critical threshold", () => {
    const detail = { ...baseDetail, mermaConTripa: 350, thresholdCritical: 300 };
    render(<WasteDetailContent detail={detail} />);
    const mermaEls = screen.getAllByText("350 g/ave");
    expect(mermaEls.length).toBeGreaterThanOrEqual(1);
    expect(mermaEls[0].className).toContain("text-red-400");
  });

  it("renders merma color as yellow when between warning and critical", () => {
    const detail = { ...baseDetail, mermaConTripa: 260, thresholdWarning: 240, thresholdCritical: 300 };
    render(<WasteDetailContent detail={detail} />);
    const mermaEls = screen.getAllByText("260 g/ave");
    expect(mermaEls.length).toBeGreaterThanOrEqual(1);
    expect(mermaEls[0].className).toContain("text-yellow-400");
  });

  it("renders merma color as green when below warning", () => {
    const detail = { ...baseDetail, mermaConTripa: 200, thresholdWarning: 240, thresholdCritical: 300 };
    render(<WasteDetailContent detail={detail} />);
    const mermaEls = screen.getAllByText("200 g/ave");
    expect(mermaEls.length).toBeGreaterThanOrEqual(1);
    expect(mermaEls[0].className).toContain("text-green-400");
  });

  it("renders threshold badges", () => {
    render(<WasteDetailContent detail={baseDetail} />);
    expect(screen.getByText("Alerta: >240g")).toBeInTheDocument();
    expect(screen.getByText(/Cr[ií]tico: >300g/)).toBeInTheDocument();
  });

  it("renders sales table when sales exist", () => {
    render(<WasteDetailContent detail={baseDetail} />);
    expect(screen.getByText("Ventas de la remesa (2)")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("does not render sales section when no sales", () => {
    const detail = { ...baseDetail, sales: [] };
    render(<WasteDetailContent detail={detail} />);
    expect(screen.queryByText(/Ventas de la remesa/)).not.toBeInTheDocument();
  });

  it("shows --- for null provider", () => {
    const detail = { ...baseDetail, provider: null };
    render(<WasteDetailContent detail={detail} />);
    const providers = screen.getAllByText(/—|---/);
    expect(providers.length).toBeGreaterThanOrEqual(1);
  });
});
