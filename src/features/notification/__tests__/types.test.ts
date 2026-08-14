import { describe, it, expect } from "vitest";
import {
  ALERT_TYPE_LABELS,
  ALERT_TYPE_ICONS,
  DETAIL_ALERT_TYPES,
} from "../types";
import type { AlertType } from "../types";

describe("notification types", () => {
  describe("ALERT_TYPE_LABELS", () => {
    it("has a label for every alert type", () => {
      const allTypes: AlertType[] = [
        "LOW_BALANCE",
        "NEGATIVE_BALANCE",
        "NEGATIVE_FLOW",
        "HIGH_WASTE",
        "OVERDUE_TASKS",
        "DELIVERY_NOT_RECEIVED",
      ];

      for (const type of allTypes) {
        expect(ALERT_TYPE_LABELS[type]).toBeTruthy();
        expect(typeof ALERT_TYPE_LABELS[type]).toBe("string");
      }
    });

    it("labels are in Spanish", () => {
      expect(ALERT_TYPE_LABELS.LOW_BALANCE).toBe("Saldo bajo");
      expect(ALERT_TYPE_LABELS.HIGH_WASTE).toBe("Merma elevada");
      expect(ALERT_TYPE_LABELS.OVERDUE_TASKS).toBe("Tareas pendientes");
    });
  });

  describe("ALERT_TYPE_ICONS", () => {
    it("has an icon for every alert type", () => {
      const allTypes: AlertType[] = [
        "LOW_BALANCE",
        "NEGATIVE_BALANCE",
        "NEGATIVE_FLOW",
        "HIGH_WASTE",
        "OVERDUE_TASKS",
        "DELIVERY_NOT_RECEIVED",
      ];

      for (const type of allTypes) {
        expect(ALERT_TYPE_ICONS[type]).toBeTruthy();
      }
    });
  });

  describe("DETAIL_ALERT_TYPES", () => {
    it("contains HIGH_WASTE, OVERDUE_TASKS, DELIVERY_NOT_RECEIVED", () => {
      expect(DETAIL_ALERT_TYPES.has("HIGH_WASTE")).toBe(true);
      expect(DETAIL_ALERT_TYPES.has("OVERDUE_TASKS")).toBe(true);
      expect(DETAIL_ALERT_TYPES.has("DELIVERY_NOT_RECEIVED")).toBe(true);
    });

    it("does not contain LOW_BALANCE", () => {
      expect(DETAIL_ALERT_TYPES.has("LOW_BALANCE")).toBe(false);
    });
  });
});
