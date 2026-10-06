import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductsPage from "../pages/ProductsPage";

const createProduct = vi.fn();

let createState: { isError: boolean; error: unknown } = { isError: false, error: null };

vi.mock("../api/product-catalog.queries", () => ({
  useProductCatalog: vi.fn(() => ({
    data: [
      {
        barcode: "A1",
        name: "Frijol negro",
        categoryName: "Abarrotes",
        unitName: "Kilo",
        status: "ACTIVE",
      },
      {
        barcode: "H1",
        name: "Horchata",
        categoryName: null,
        unitName: "Pieza",
        status: "ACTIVE",
      },
    ],
    isLoading: false,
    isError: false,
  })),
  useCreateProduct: vi.fn(() => ({
    mutate: createProduct,
    isPending: false,
    isError: createState.isError,
    error: createState.error,
  })),
}));

vi.mock("../../product/api/categories.queries", () => ({
  useCategories: vi.fn(() => ({
    data: [
      { id: 10, name: "Abarrotes" },
      { id: 11, name: "IT Categoria" },
    ],
  })),
}));

vi.mock("../../product/api/measurementUnits.queries", () => ({
  useMeasurementUnits: vi.fn(() => ({
    data: [
      { id: 1, name: "Kilo" },
      { id: 2, name: "IT Unidad" },
    ],
  })),
}));

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProductsPage />
    </QueryClientProvider>,
  );
}

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createState = { isError: false, error: null };
  });

  it("lists catalog products with their status", () => {
    renderPage();

    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("Frijol negro")).toBeInTheDocument();
    expect(screen.getAllByText("Activo").length).toBe(2);
  });

  it("filters the list by code or name", () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Buscar por código o nombre"), {
      target: { value: "horch" },
    });

    expect(screen.queryByText("Frijol negro")).not.toBeInTheDocument();
    expect(screen.getByText("Horchata")).toBeInTheDocument();
  });

  it("creates a product with category and unit, hiding test rows", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Nuevo producto" }));

    fireEvent.change(screen.getByPlaceholderText("Código"), {
      target: { value: "N1" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nombre del producto"), {
      target: { value: "Nuevo" },
    });

    expect(screen.queryByText("IT Categoria")).not.toBeInTheDocument();
    expect(screen.queryByText("IT Unidad")).not.toBeInTheDocument();

    const [categorySelect, unitSelect] = screen.getAllByRole("combobox");
    fireEvent.change(categorySelect, { target: { value: "10" } });
    fireEvent.change(unitSelect, { target: { value: "1" } });

    const saveButton = screen.getByRole("button", { name: "Crear producto" });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    expect(createProduct).toHaveBeenCalledWith(
      { barcode: "N1", name: "Nuevo", categoryId: 10, unitId: 1 },
      expect.anything(),
    );
  });

  it("shows the server message when the barcode already exists", () => {
    createState = {
      isError: true,
      error: { response: { data: { message: "El producto ya existe: A1" } } },
    };
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Nuevo producto" }));

    expect(screen.getByText("El producto ya existe: A1")).toBeInTheDocument();
  });
});
