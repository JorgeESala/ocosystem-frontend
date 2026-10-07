import { describe, it, expect, vi, beforeEach } from "vitest";
import { productReceiptsApi } from "../api/product-receipts.api";

vi.mock("@/shared/api/http", () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockPost = vi.fn();
  return {
    http: {
      get: mockGet,
      put: mockPut,
      post: mockPost,
    },
  };
});

import { http } from "@/shared/api/http";

const mockedHttp = vi.mocked(http);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("productReceiptsApi", () => {
  it("catalogProducts keeps only active, non-test products", async () => {
    mockedHttp.get.mockResolvedValue({
      data: [
        { barcode: "A1", name: "Frijol", status: "ACTIVE" },
        { barcode: "P1", name: "Pendiente", status: "PENDING" },
        { barcode: "IT-9", name: "IT Prueba", status: "ACTIVE" },
        { barcode: "L1", name: "Libre", status: null },
      ],
    });

    const result = await productReceiptsApi.catalogProducts();

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/products");
    expect(result).toEqual([
      { barcode: "A1", name: "Frijol", status: "ACTIVE" },
      { barcode: "L1", name: "Libre", status: null },
    ]);
  });
});
