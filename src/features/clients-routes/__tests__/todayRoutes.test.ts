import { describe, it, expect } from "vitest";
import { routesForToday } from "../utils/todayRoutes";
import { todayWeekday } from "../config/unitConfig";
import { includesNormalized, normalizeText } from "../utils/text";

const entries = [
  { routeId: 1, name: "Centro", deliveryDays: [1, 3], activeClients: 10 },
  { routeId: 2, name: "Sur", deliveryDays: [3], activeClients: 5 },
  { routeId: 3, name: "Norte", deliveryDays: [], activeClients: 2 },
];

describe("routesForToday", () => {
  it("filtra las rutas que operan el día y suma sus clientes", () => {
    const today = routesForToday(entries, 3);

    expect(today.routes.map((route) => route.routeId)).toEqual([1, 2]);
    expect(today.clientCount).toBe(15);
  });

  it("devuelve vacío cuando ninguna ruta opera el día", () => {
    const today = routesForToday(entries, 5);

    expect(today.routes).toEqual([]);
    expect(today.clientCount).toBe(0);
  });
});

describe("todayWeekday", () => {
  it("usa lunes=1 y domingo=7", () => {
    expect(todayWeekday(new Date(2030, 0, 7))).toBe(1);
    expect(todayWeekday(new Date(2030, 0, 6))).toBe(7);
  });
});

describe("text utils", () => {
  it("normaliza acentos y mayúsculas", () => {
    expect(normalizeText("  Peña Blanca ")).toBe("pena blanca");
    expect(includesNormalized("Abarrotes Peña", "pena")).toBe(true);
    expect(includesNormalized("Abarrotes Peña", "PENA")).toBe(true);
  });
});
