import { Card } from "flowbite-react";
import { formatMXNCompact } from "@/utils/moneyNumbers";
import { formatUnits } from "../utils/productMetrics";

export interface TopProductRow {
  productBarcode: string;
  productName: string;
  quantitySold: number;
  totalSales: number;
  unitName: string;
  participation: number;
}

interface Props {
  products: TopProductRow[];
  isLoading?: boolean;
}

export const TopProductsCard = ({ products, isLoading }: Props) => {
  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200">
          Productos Estrella (Top 5)
        </h3>
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
          Por Ingreso
        </span>
      </div>
      {isLoading ? (
        <div className="space-y-5">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="animate-pulse space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-700" />
              <div className="h-2 w-full rounded-full bg-gray-700" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          Sin productos para mostrar con los filtros actuales.
        </p>
      ) : (
        <div className="space-y-5">
          {products.map((product, index) => (
            <div key={product.productBarcode} className="group">
              <div className="mb-2 flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-200 transition-colors group-hover:text-blue-400">
                    {index + 1}. {product.productName}
                  </span>
                  <span className="text-[11px] text-gray-500 uppercase">
                    {`${formatUnits(product.quantitySold)} ${product.unitName}`}
                  </span>
                </div>
                <span className="font-mono font-bold text-blue-400">
                  {formatMXNCompact(product.totalSales)}
                </span>
              </div>
              {/* Barra de progreso */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
                  style={{ width: `${product.participation}%` }}
                />
              </div>
              <div className="mt-1 flex justify-end">
                <span className="text-[11px] font-medium text-gray-500">
                  {product.participation.toFixed(1)}% del ingreso total
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
