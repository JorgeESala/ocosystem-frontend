import { describe, expect, it } from "vitest";
import { BUSINESSES } from "../business.config";
import { buildBreadcrumbs, findCurrentBusiness } from "../business.breadcrumbs";

const egg = BUSINESSES.find((business) => business.key === "EGG")!;
const branches = BUSINESSES.find((business) => business.key === "BRANCHES")!;

describe("business breadcrumbs", () => {
  it("finds the business from the URL among the allowed units", () => {
    expect(findCurrentBusiness("/business/huevo/accounting", BUSINESSES)).toBe(
      egg,
    );
    expect(findCurrentBusiness("/business/sucursales", BUSINESSES)).toBe(
      branches,
    );
    expect(findCurrentBusiness("/", BUSINESSES)).toBeNull();
  });

  it("builds the grouped path for a menu page", () => {
    expect(buildBreadcrumbs("/business/huevo/accounting", egg)).toEqual([
      { label: "Finanzas" },
      { label: "Contabilidad" },
    ]);
  });

  it("adds Ayuda for a help sub-page", () => {
    expect(buildBreadcrumbs("/business/huevo/accounting/help", egg)).toEqual([
      { label: "Finanzas" },
      { label: "Contabilidad" },
      { label: "Ayuda" },
    ]);
  });

  it("uses the menu label for a page without a group", () => {
    expect(buildBreadcrumbs("/business/sucursales/reports", branches)).toEqual([
      { label: "Reportes" },
    ]);
  });

  it("labels known pages that are not in the menu", () => {
    expect(buildBreadcrumbs("/business/huevo/mis-tareas", egg)).toEqual([
      { label: "Mis tareas" },
    ]);
    expect(buildBreadcrumbs("/business/huevo/collections", egg)).toEqual([
      { label: "Cobrar" },
    ]);
    expect(
      buildBreadcrumbs("/business/sucursales/checklist/calendar", branches),
    ).toEqual([{ label: "Desempeño" }, { label: "Calendario" }]);
  });

  it("falls back to Inicio on the unit home", () => {
    expect(buildBreadcrumbs("/business/huevo", egg)).toEqual([
      { label: "Inicio" },
    ]);
  });
});
