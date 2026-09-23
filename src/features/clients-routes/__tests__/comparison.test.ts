import { describe, it, expect } from "vitest";
import { previousRangeFor } from "../utils/comparison";

describe("previousRangeFor", () => {
  it("WINDOW usa la ventana de igual duración inmediatamente anterior", () => {
    expect(previousRangeFor("2030-01-01", "2030-01-31", "WINDOW")).toEqual({
      from: "2029-12-01",
      to: "2029-12-31",
    });

    expect(previousRangeFor("2030-01-01", "2030-01-22", "WINDOW")).toEqual({
      from: "2029-12-10",
      to: "2029-12-31",
    });
  });

  it("PREVIOUS_MONTH compara el mismo tramo del mes anterior", () => {
    expect(
      previousRangeFor("2030-01-01", "2030-01-22", "PREVIOUS_MONTH"),
    ).toEqual({
      from: "2029-12-01",
      to: "2029-12-22",
    });
  });

  it("PREVIOUS_MONTH ajusta los meses cortos", () => {
    expect(
      previousRangeFor("2030-03-01", "2030-03-31", "PREVIOUS_MONTH"),
    ).toEqual({
      from: "2030-02-01",
      to: "2030-02-28",
    });
  });

  it("rangos de un día comparan contra el día anterior", () => {
    expect(previousRangeFor("2030-01-01", "2030-01-01", "WINDOW")).toEqual({
      from: "2029-12-31",
      to: "2029-12-31",
    });
    expect(
      previousRangeFor("2030-01-01", "2030-01-01", "PREVIOUS_MONTH"),
    ).toEqual({
      from: "2029-12-01",
      to: "2029-12-01",
    });
  });
});
