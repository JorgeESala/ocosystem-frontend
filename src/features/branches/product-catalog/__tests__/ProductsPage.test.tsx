import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductsPage from "../pages/ProductsPage";

const createProduct = vi.fn();
const linkProduct = vi.fn();
const unlinkProduct = vi.fn();

const defaultCatalog = [
  {
    barcode: "A1",
    name: "Frijol negro",
    categoryName: "Abarrotes",
    unitName: "Kilo",
    status: "ACTIVE",
    sku: "A1",
    isCanonical: true,
  },
  {
    barcode: "H1",
    name: "Horchata",
    categoryName: null,
    unitName: "Pieza",
    status: "ACTIVE",
    sku: "H1",
    isCanonical: true,
  },
];

let catalogData: Record<string, unknown>[] = [...defaultCatalog];
let createState: { isError: boolean; error: unknown } = { isError: false, error: null };
let linkState: { isError: boolean; error: unknown } = { isError: false, error: null };
let unlinkState: { isError: boolean; error: unknown } = {
  isError: false,
  error: null,
};

vi.mock("../api/product-catalog.queries", () => ({
  useProductCatalog: vi.fn(() => ({
    data: catalogData,
    isLoading: false,
    isError: false,
  })),
  useCreateProduct: vi.fn(() => ({
    mutate: createProduct,
    isPending: false,
    isError: createState.isError,
    error: createState.error,
  })),
  useLinkProduct: vi.fn(() => ({
    mutateAsync: linkProduct,
    isPending: false,
    isError: linkState.isError,
    error: linkState.error,
  })),
  useUnlinkProduct: vi.fn(() => ({
    mutateAsync: unlinkProduct,
    isPending: false,
    isError: unlinkState.isError,
    error: unlinkState.error,
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
    catalogData = [...defaultCatalog];
    createState = { isError: false, error: null };
    linkState = { isError: false, error: null };
    unlinkState = { isError: false, error: null };
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

  it("shows how many codes share the same product", () => {
    catalogData = [
      {
        barcode: "C1",
        name: "Casillero 12",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: true,
      },
      {
        barcode: "C2",
        name: "Casillero 12 promo",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: false,
      },
    ];

    renderPage();

    expect(screen.getAllByText("2 códigos")).toHaveLength(2);
    expect(screen.getByText("variante")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Desvincular" })).toHaveLength(1);
  });

  it("shows the server message when the link fails", () => {
    linkState = {
      isError: true,
      error: {
        response: { data: { message: "Debe indicar el producto destino" } },
      },
    };
    renderPage();

    fireEvent.click(screen.getAllByRole("button", { name: "Vincular" })[0]);

    expect(
      screen.getByText("Debe indicar el producto destino"),
    ).toBeInTheDocument();
  });

  it("warns that every code of a multi-code product moves with it", () => {
    catalogData = [
      {
        barcode: "C1",
        name: "Casillero 12",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: true,
      },
      {
        barcode: "C2",
        name: "Casillero 12 promo",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: false,
      },
      {
        barcode: "D1",
        name: "Casillero 24",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "D1",
        isCanonical: true,
      },
    ];

    renderPage();

    fireEvent.click(screen.getAllByRole("button", { name: "Vincular" })[0]);
    fireEvent.click(screen.getByRole("button", { name: /Casillero 24/ }));

    expect(screen.getByText(/2 códigos en el catálogo/)).toBeInTheDocument();
  });

  it("asks for confirmation before unlinking a variant", () => {
    catalogData = [
      {
        barcode: "C1",
        name: "Casillero 12",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: true,
      },
      {
        barcode: "C2",
        name: "Casillero 12 promo",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: false,
      },
    ];

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Desvincular" }));

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(unlinkProduct).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Desvincular" }));

    expect(unlinkProduct).toHaveBeenCalledWith("C2");
    confirmSpy.mockRestore();
  });

  it("lists the codes of a product together and marks the principal row", () => {
    catalogData = [
      {
        barcode: "Z1",
        name: "Zeta",
        categoryName: "Abarrotes",
        unitName: "Kilo",
        status: "ACTIVE",
        sku: "Z1",
        isCanonical: true,
      },
      {
        barcode: "C2",
        name: "Casillero promo",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: false,
      },
      {
        barcode: "C1",
        name: "Casillero 12",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: true,
      },
    ];

    renderPage();

    const codes = screen
      .getAllByRole("row")
      .map((row) => row.querySelector("td")?.textContent ?? "")
      .filter(Boolean);

    expect(codes).toEqual(["C1", "C2", "Z1"]);
    expect(screen.getAllByText("principal")).toHaveLength(1);
    expect(screen.getByText("de C1")).toBeInTheDocument();
  });

  it("only lists principal products as link targets", () => {
    catalogData = [
      {
        barcode: "C1",
        name: "Casillero 12",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: true,
      },
      {
        barcode: "C2",
        name: "Casillero 12 promo",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: false,
      },
      {
        barcode: "D1",
        name: "Casillero 24",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "D1",
        isCanonical: true,
      },
      {
        barcode: "D2",
        name: "Casillero 24 promo",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "D1",
        isCanonical: false,
      },
    ];

    renderPage();

    fireEvent.click(screen.getAllByRole("button", { name: "Vincular" })[0]);
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Casillero 24")).toBeInTheDocument();
    expect(within(dialog).queryByText("Casillero 12 promo")).toBeNull();
    expect(within(dialog).queryByText("Casillero 24 promo")).toBeNull();
  });

  it("shows how many codes a link target already has", () => {
    catalogData = [
      {
        barcode: "C1",
        name: "Casillero 12",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: true,
      },
      {
        barcode: "C2",
        name: "Casillero 12 promo",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "C1",
        isCanonical: false,
      },
      {
        barcode: "D1",
        name: "Casillero 24",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "D1",
        isCanonical: true,
      },
      {
        barcode: "D2",
        name: "Casillero 24 promo",
        categoryName: "Huevo",
        unitName: "Pieza",
        status: "ACTIVE",
        sku: "D1",
        isCanonical: false,
      },
    ];

    renderPage();

    fireEvent.click(screen.getAllByRole("button", { name: "Vincular" })[0]);
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("2 códigos")).toBeInTheDocument();
  });
});
