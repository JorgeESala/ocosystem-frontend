import { beforeEach, describe, expect, it } from "vitest";
import {
  loadHideEmptyOnPrint,
  saveHideEmptyOnPrint,
} from "../utils/routeOrderPreferences";

describe("routeOrderPreferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("guarda y recupera la preferencia de ocultar clientes sin pedido", () => {
    expect(loadHideEmptyOnPrint()).toBe(false);

    saveHideEmptyOnPrint(true);
    expect(loadHideEmptyOnPrint()).toBe(true);

    saveHideEmptyOnPrint(false);
    expect(loadHideEmptyOnPrint()).toBe(false);
  });
});
