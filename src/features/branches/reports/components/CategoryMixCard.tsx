import { Card } from "flowbite-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMXN } from "@/utils/moneyNumbers";
import type { CategorySalesDTO } from "../api/salesReports.api";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

interface Props {
  categories: CategorySalesDTO[];
  totalSales: number;
  selectedCategory?: string | null;
  onSelectCategory?: (categoryName: string | null) => void;
}

interface PercentLabelProps {
  cx?: string | number;
  cy?: string | number;
  midAngle?: string | number;
  innerRadius?: string | number;
  outerRadius?: string | number;
  percent?: string | number;
}

const renderPercentLabel = (props: PercentLabelProps) => {
  const cx = Number(props.cx);
  const cy = Number(props.cy);
  const midAngle = Number(props.midAngle);
  const innerRadius = Number(props.innerRadius);
  const outerRadius = Number(props.outerRadius);
  const percent = Number(props.percent);

  if (
    ![cx, cy, midAngle, innerRadius, outerRadius, percent].every(
      Number.isFinite,
    )
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#9CA3AF"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[10px] font-bold"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export const CategoryMixCard = ({
  categories,
  totalSales,
  selectedCategory,
  onSelectCategory,
}: Props) => {
  const commercialCategories = categories.filter(
    (category) =>
      category.categoryName !== "Matados" && category.categoryName !== "Merma",
  );

  if (commercialCategories.length === 0) return null;

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-md mb-2 font-semibold text-gray-200">
          Ventas por categoría
        </h3>
        {onSelectCategory && (
          <span className="text-[11px] text-gray-500">
            Clic para filtrar productos
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={commercialCategories as never[]}
                dataKey="totalSales"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                label={renderPercentLabel}
              >
                {commercialCategories.map((category, index) => (
                  <Cell
                    key={category.categoryId}
                    fill={COLORS[index % COLORS.length]}
                    opacity={
                      selectedCategory &&
                      selectedCategory !== category.categoryName
                        ? 0.35
                        : 1
                    }
                    className={onSelectCategory ? "cursor-pointer" : undefined}
                    onClick={() =>
                      onSelectCategory?.(
                        selectedCategory === category.categoryName
                          ? null
                          : category.categoryName,
                      )
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value: number) => formatMXN(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 px-2 pb-2">
          {commercialCategories.slice(0, 6).map((category, index) => {
            const percentage =
              totalSales > 0
                ? (((category.totalSales ?? 0) / totalSales) * 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={category.categoryId}
                className="flex items-center justify-between gap-4 border-b border-gray-700/50 pb-1 text-xs"
              >
                <div className="flex items-start gap-2">
                  <div
                    className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="leading-tight font-medium text-gray-300">
                    {category.categoryName}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-bold text-white">
                    {formatMXN(category.totalSales ?? 0)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
