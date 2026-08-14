import { describe, it, expect, vi, beforeEach } from "vitest";
import { notificationApi } from "../api/notification.api";

vi.mock("@/shared/api/http", () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockPost = vi.fn();
  const mockDelete = vi.fn();
  return {
    http: {
      get: mockGet,
      put: mockPut,
      post: mockPost,
      delete: mockDelete,
    },
  };
});

import { http } from "@/shared/api/http";

const mockedHttp = vi.mocked(http);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("notificationApi", () => {
  describe("getSummary", () => {
    it("builds URL with branchIds as repeated params", async () => {
      mockedHttp.get.mockResolvedValue({
        data: { unreadCount: 3, recent: [] },
      });

      const result = await notificationApi.getSummary([1, 2, 3]);

      expect(mockedHttp.get).toHaveBeenCalledWith(
        expect.stringContaining("branchIds=1"),
      );
      expect(mockedHttp.get).toHaveBeenCalledWith(
        expect.stringContaining("branchIds=2"),
      );
      expect(mockedHttp.get).toHaveBeenCalledWith(
        expect.stringContaining("branchIds=3"),
      );
      expect(result).toEqual({ unreadCount: 3, recent: [] });
    });
  });

  describe("getAll", () => {
    it("builds URL with branchIds", async () => {
      mockedHttp.get.mockResolvedValue({ data: [] });

      await notificationApi.getAll([5]);

      expect(mockedHttp.get).toHaveBeenCalledWith(
        expect.stringContaining("branchIds=5"),
      );
    });
  });

  describe("markAsRead", () => {
    it("calls PUT with notification id", async () => {
      mockedHttp.put.mockResolvedValue({});

      await notificationApi.markAsRead(42);

      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/notifications/42/read",
      );
    });
  });

  describe("markAllAsRead", () => {
    it("calls PUT with branchIds in query string", async () => {
      mockedHttp.put.mockResolvedValue({});

      await notificationApi.markAllAsRead([1, 2]);

      const url = mockedHttp.put.mock.calls[0][0] as string;
      expect(url).toContain("branchIds=1");
      expect(url).toContain("branchIds=2");
      expect(url).toContain("/read-all");
    });
  });

  describe("checkAlerts", () => {
    it("calls POST with branchIds", async () => {
      mockedHttp.post.mockResolvedValue({});

      await notificationApi.checkAlerts([10]);

      const url = mockedHttp.post.mock.calls[0][0] as string;
      expect(url).toContain("branchIds=10");
      expect(url).toContain("/check");
    });
  });

  describe("getDetail", () => {
    it("returns data on success", async () => {
      const detail = {
        alertType: "HIGH_WASTE",
        branchId: 1,
        branchName: "Test",
        detail: {},
      };
      mockedHttp.get.mockResolvedValue({ data: detail });

      const result = await notificationApi.getDetail(5);

      expect(result).toEqual(detail);
      expect(mockedHttp.get).toHaveBeenCalledWith(
        "/api/v1/notifications/5/detail",
      );
    });

    it("returns null on error", async () => {
      mockedHttp.get.mockRejectedValue(new Error("Network error"));

      const result = await notificationApi.getDetail(5);

      expect(result).toBeNull();
    });
  });

  describe("getHistory", () => {
    it("builds URL with branchIds, page, and size", async () => {
      mockedHttp.get.mockResolvedValue({
        data: {
          content: [],
          page: { size: 20, number: 0, totalElements: 0, totalPages: 0 },
        },
      });

      await notificationApi.getHistory([1, 2], 1, 10);

      const url = mockedHttp.get.mock.calls[0][0] as string;
      expect(url).toContain("branchIds=1");
      expect(url).toContain("branchIds=2");
      expect(url).toContain("page=1");
      expect(url).toContain("size=10");
    });
  });
});
