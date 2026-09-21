import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { RouteWeekCalendar } from "../components/RouteWeekCalendar";

const entries = [
  {
    routeId: 1,
    name: "Ruta Centro",
    deliveryDays: [1, 3, 5],
    activeClients: 12,
  },
  {
    routeId: 2,
    name: "Ruta Sur",
    deliveryDays: [],
    activeClients: 0,
  },
];

describe("RouteWeekCalendar", () => {
  it("muestra los días de entrega y los clientes activos por ruta", () => {
    render(<RouteWeekCalendar entries={entries} />);

    expect(screen.getByText("Ruta Centro")).toBeInTheDocument();
    expect(screen.getByText("Ruta Sur")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    const centroRow = screen.getByText("Ruta Centro").closest("tr");
    expect(centroRow).not.toBeNull();
    const dias = within(centroRow as HTMLElement).getAllByTestId("day-active");
    expect(dias).toHaveLength(3);
  });
});
