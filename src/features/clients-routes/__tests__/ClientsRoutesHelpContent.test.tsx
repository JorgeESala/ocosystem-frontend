import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ClientHistoryHelpContent,
  ClientRouteHelpContent,
  ClientTypesHelpContent,
  RouteDeliveryDaysHelpContent,
  RouteLocalitiesHelpContent,
  RouteProfitabilityHelpContent,
  SummaryAttentionHelpContent,
  SummaryKpiHelpContent,
} from "../components/ClientsRoutesHelpContent";

describe("ClientsRoutesHelpContent", () => {
  it("explica cómo se asigna la ruta por localidad", () => {
    render(<ClientRouteHelpContent />);

    expect(screen.getByText("¿Cómo se asigna la ruta?")).toBeInTheDocument();
    expect(screen.getByText(/se asigna por la localidad/i)).toBeInTheDocument();
    expect(screen.getByText("Sin ruta")).toBeInTheDocument();
  });

  it("explica que una localidad puede estar en varias rutas", () => {
    render(<RouteLocalitiesHelpContent />);

    expect(
      screen.getByText(/puede estar en varias rutas/i),
    ).toBeInTheDocument();
  });

  it("explica los días de entrega de la ruta", () => {
    render(<RouteDeliveryDaysHelpContent />);

    expect(screen.getByText(/Lun a Dom/i)).toBeInTheDocument();
  });

  it("explica la fórmula de utilidad y el prorrateo del costo", () => {
    render(<RouteProfitabilityHelpContent />);

    expect(
      screen.getByText(/Utilidad = Ventas − Costo de remesa − Combustible/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no tiene peso o cantidad registrada/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/nómina de choferes/i)).toBeInTheDocument();
  });

  it("explica qué muestra el historial de compras", () => {
    render(<ClientHistoryHelpContent />);

    expect(screen.getByText(/última compra/i)).toBeInTheDocument();
  });

  it("explica los KPIs del resumen", () => {
    render(<SummaryKpiHelpContent />);

    expect(screen.getByText(/Ticket promedio/)).toBeInTheDocument();
    expect(screen.getByText(/periodo anterior/)).toBeInTheDocument();
  });

  it("explica las tarjetas de atención", () => {
    render(<SummaryAttentionHelpContent />);

    expect(screen.getByText(/Dormidos/)).toBeInTheDocument();
    expect(screen.getByText(/Sin ruta/)).toBeInTheDocument();
    expect(screen.getByText(/Todo al día/)).toBeInTheDocument();
  });

  it("explica los tipos de cliente", () => {
    render(<ClientTypesHelpContent />);

    expect(screen.getByText(/Sucursales/)).toBeInTheDocument();
    expect(screen.getByText(/Internos/)).toBeInTheDocument();
    expect(screen.getByText(/Externos/)).toBeInTheDocument();
    expect(screen.getByText(/inactivos/)).toBeInTheDocument();
  });
});
