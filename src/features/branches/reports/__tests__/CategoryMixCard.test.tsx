import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MockResponsiveContainer } from "@/test/rechartsMock";
import { CategoryMixCard } from "../components/CategoryMixCard";

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: MockResponsiveContainer,
}));

const costs = [
  { categoryId: 1, categoryName: "Pollo", amount: 1000 },
  { categoryId: 10, categoryName: "Frutas y verduras", amount: 8496.338 },
];

const sales = [
  { categoryId: 1, categoryName: "Pollo", amount: 800 },
  { categoryId: 10, categoryName: "Abarrotes", amount: 200 },
];

describe("CategoryMixCard", () => {
  it("renders cost categories with amounts and percentages without the filter hint", () => {
    render(
      <CategoryMixCard
        title="Costos por categoría"
        categories={costs}
        total={9496.338}
      />,
    );

    expect(screen.getByText("Costos por categoría")).toBeTruthy();
    expect(screen.getByText("Pollo")).toBeTruthy();
    expect(screen.getByText("Frutas y verduras")).toBeTruthy();
    expect(screen.getByText("$1,000.00")).toBeTruthy();
    expect(screen.getByText("$8,496.34")).toBeTruthy();
    expect(screen.queryByText("$8,496.338")).toBeNull();
    expect(screen.getByText("10.5%")).toBeTruthy();
    expect(screen.getByText("89.5%")).toBeTruthy();
    expect(screen.queryByText("Clic para filtrar productos")).toBeNull();
  });

  it("keeps the sales title and filter hint when interactive", () => {
    render(
      <CategoryMixCard
        title="Ventas por categoría"
        categories={sales}
        total={1000}
        onSelectCategory={() => undefined}
      />,
    );

    expect(screen.getByText("Ventas por categoría")).toBeTruthy();
    expect(screen.getByText("Clic para filtrar productos")).toBeTruthy();
  });
});
