import { Card, Select } from "flowbite-react";
import { ProductBranchMatrix, type MatrixMetric } from "./ProductBranchMatrix";
import { ProductCatalogCard } from "./ProductCatalogCard";
import { TopCategoryToggles } from "./TopCategoryToggles";
import type { ProductAnalyticsRowDTO } from "../api/productAnalytics.api";

interface Props {
  branches: { id: number; name: string }[];
  categoryOptions: { id: number; name: string }[];
  metric: MatrixMetric;
  onMetricChange: (metric: MatrixMetric) => void;
  categoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  hideChicken: boolean;
  hideEgg: boolean;
  onToggleChange: (hideChicken: boolean, hideEgg: boolean) => void;
  matrixRows: ProductAnalyticsRowDTO[];
  matrixLoading: boolean;
  catalogRows: ProductAnalyticsRowDTO[];
  catalogTotal: number;
  catalogPage: number;
  catalogPageSize: number;
  catalogLoading: boolean;
  catalogSearchValue: string;
  onCatalogSearchChange: (value: string) => void;
  onCatalogPageChange: (page: number) => void;
  onSelectProduct: (barcode: string, productName: string) => void;
}

export const ProductAnalyticsSection = ({
  branches,
  categoryOptions,
  metric,
  onMetricChange,
  categoryId,
  onCategoryChange,
  hideChicken,
  hideEgg,
  onToggleChange,
  matrixRows,
  matrixLoading,
  catalogRows,
  catalogTotal,
  catalogPage,
  catalogPageSize,
  catalogLoading,
  catalogSearchValue,
  onCatalogSearchChange,
  onCatalogPageChange,
  onSelectProduct,
}: Props) => (
  <div className="space-y-6">
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Select
            className="w-full sm:w-52"
            value={categoryId ?? ""}
            onChange={(event) =>
              onCategoryChange(
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          >
            <option value="">Todas las categorías</option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Select>
        </div>
        <TopCategoryToggles
          hideChicken={hideChicken}
          hideEgg={hideEgg}
          onChange={onToggleChange}
        />
      </div>
    </Card>

    <ProductBranchMatrix
      rows={matrixRows}
      branches={branches}
      metric={metric}
      onMetricChange={onMetricChange}
      onSelectProduct={onSelectProduct}
      isLoading={matrixLoading}
    />

    <ProductCatalogCard
      rows={catalogRows}
      total={catalogTotal}
      page={catalogPage}
      pageSize={catalogPageSize}
      metric={metric}
      isLoading={catalogLoading}
      searchValue={catalogSearchValue}
      onSearchChange={onCatalogSearchChange}
      onPageChange={onCatalogPageChange}
      onSelectProduct={onSelectProduct}
    />
  </div>
);
