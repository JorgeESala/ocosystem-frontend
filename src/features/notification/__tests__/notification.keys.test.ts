import { describe, it, expect } from "vitest";
import { notificationKeys } from "../api/notification.keys";

describe("notificationKeys", () => {
  it("summary key includes sorted branch ids", () => {
    const key = notificationKeys.summary([3, 1, 2]);
    expect(key).toEqual(["notifications", "summary", [1, 2, 3]]);
  });

  it("list key includes sorted branch ids", () => {
    const key = notificationKeys.list([5, 2]);
    expect(key).toEqual(["notifications", "list", [2, 5]]);
  });

  it("detail key uses notification id", () => {
    const key = notificationKeys.detail(42);
    expect(key).toEqual(["notifications", "detail", 42]);
  });

  it("history key includes sorted branch ids", () => {
    const key = notificationKeys.history([10, 1, 5]);
    expect(key).toEqual(["notifications", "history", [1, 5, 10]]);
  });

  it("same branch ids in different order produce same key", () => {
    const key1 = notificationKeys.summary([3, 1, 2]);
    const key2 = notificationKeys.summary([2, 3, 1]);
    expect(key1).toEqual(key2);
  });
});
