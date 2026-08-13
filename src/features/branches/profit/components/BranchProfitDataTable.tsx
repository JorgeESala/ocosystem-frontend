import { Card } from "flowbite-react";
import { useMemo, useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
}

interface BranchProfitDataTableProps {
  columns: Column[];
  data: Record<string, string | number>[];
}

export default function BranchProfitDataTable({
  columns,
  data,
}: BranchProfitDataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="w-full">
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 md:block">
        <table className="min-w-full border-collapse bg-slate-950/40 text-white">
          <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-slate-400 uppercase">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-semibold ${
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

          <tbody className="divide-y divide-slate-800">
            {sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-slate-900/40">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-slate-100"
                  >
                    {renderCell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {sortedData.map((row, index) => (
          <Card
            key={index}
            className="border border-slate-800 bg-slate-950/60 text-white"
          >
            <div className="space-y-2">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="text-sm font-semibold text-slate-400">
                    {col.label}
                  </span>
                  <span className="text-right text-sm text-slate-100">
                    {renderCell(col, row)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
