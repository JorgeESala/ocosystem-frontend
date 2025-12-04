import { Card } from "flowbite-react";
import { useState, useMemo } from "react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
}

interface ResponsiveSortableTableProps {
  columns: Column[];
  data: Record<string, string | number>[];
}

export default function ResponsiveSortableTable({
  columns,
  data,
}: ResponsiveSortableTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const renderCell = (col: Column, row: Record<string, any>) => {
    const rawValue = row[col.key];
    return col.render ? col.render(rawValue, row) : String(rawValue);
  };

  return (
    <div className="w-full">
      {/* DESKTOP TABLE */}
      <div className="hidden overflow-x-auto rounded-lg shadow md:block">
        <table className="min-w-full divide-y divide-gray-700 bg-gray-800 text-white">
          <thead className="bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-sm font-semibold ${
                    col.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <>
                        {sortDir === "asc" ? (
                          <HiChevronUp className="h-4 w-4" />
                        ) : (
                          <HiChevronDown className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {sortedData.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2 text-sm">
                    {renderCell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-3 md:hidden">
        {sortedData.map((row, i) => (
          <Card
            key={i}
            className="border border-gray-700 bg-gray-800 text-white"
          >
            <div className="space-y-2">
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between">
                  <span className="font-semibold">{col.label}:</span>
                  <span>{renderCell(col, row)}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
