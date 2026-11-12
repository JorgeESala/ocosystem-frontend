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
  { categoryId: 10, categoryName: "Abarrotes", amount: 250 },
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
        total={1250}
      />,
    );

    expect(screen.getByText("Costos por categoría")).toBeTruthy();
    expect(screen.getByText("Pollo")).toBeTruthy();
    expect(screen.getByText("Abarrotes")).toBeTruthy();
    expect(screen.getByText("80.0%")).toBeTruthy();
    expect(screen.getByText("20.0%")).toBeTruthy();
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
