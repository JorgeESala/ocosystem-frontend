import { describe, expect, it } from "vitest";
import { TASK_META, TASK_ORDER } from "../config/checklist.config";

describe("checklist task config", () => {
  it("includes the remesa price task pointing to Entradas y Ventas", () => {
    expect(TASK_META.UPDATE_REMESA_PRICE.shortLabel).toBe("Precio remesa");
    expect(TASK_META.UPDATE_REMESA_PRICE.actionPath).toBe("salesAndBatches");
  });

  it("orders every configured task", () => {
    expect(TASK_ORDER).toContain("UPDATE_REMESA_PRICE");
    expect(new Set(TASK_ORDER)).toEqual(new Set(Object.keys(TASK_META)));
  });
});
