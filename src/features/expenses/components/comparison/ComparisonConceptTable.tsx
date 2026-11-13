import { useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import TablePagination from "@/components/TablePagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import ComparisonMetricCells from "./ComparisonMetricCells";
import ComparisonTableHead from "./ComparisonTableHead";
import {
  filterComparisonItems,
  type ComparisonMetric,
} from "../../utils/expense-comparison";

interface ComparisonConceptTableProps {
  items: ComparisonMetric[];
  title?: string;
  firstColumnLabel?: string;
  initialLimit?: number;
  pageSize?: number;
  forceExpanded?: boolean;
  searchPlaceholder?: string;
}

export default function ComparisonConceptTable({
  items,
  title,
  firstColumnLabel = "Concepto",
  initialLimit = 10,
  pageSize = 25,
  forceExpanded = false,
  searchPlaceholder = "Buscar concepto...",
}: ComparisonConceptTableProps) {
  const [expanded, setExpanded] = useState(forceExpanded);
  const [query, setQuery] = useState("");
  const filtered = filterComparisonItems(items, query);
  const searching = query.trim().length > 0;
  const isExpanded = forceExpanded || expanded || searching;
  const visibleItems = isExpanded ? filtered : filtered.slice(0, initialLimit);
  const pager = useClientPagination(visibleItems, {
    pageSize,
    resetKey: `${query}|${isExpanded}|${items.length}`,
  });
  const showSearch = forceExpanded || items.length > initialLimit;
  const showToggle =
    !forceExpanded && (isExpanded || items.length > initialLimit);

  const collapse = () => {
    setExpanded(false);
    setQuery("");
  };

  return (
    <div className="space-y-2">
      {(title || showSearch || showToggle) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          {title ? (
            <h3 className="text-sm font-semibold text-white">{title}</h3>
          ) : (
            <span />
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {showSearch && (
              <TextInput
                icon={HiSearch}
                sizing="sm"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full sm:w-64"
              />
            )}
            {showToggle && (
              <Button
                size="xs"
                color="gray"
                onClick={() => (isExpanded ? collapse() : setExpanded(true))}
              >
                {isExpanded ? "Ver menos" : `Ver todos (${items.length})`}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <ComparisonTableHead firstColumnLabel={firstColumnLabel} />
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {pager.pageItems.map((item) => (
              <tr key={item.code} className="hover:bg-slate-900/40">
                <td className="px-3 py-2.5 font-medium text-slate-100">
                  {item.label}
                </td>
                <ComparisonMetricCells {...item} />
              </tr>
            ))}
            {pager.pageItems.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No hay conceptos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isExpanded && (
        <TablePagination
          page={pager.page}
          pageSize={pager.pageSize}
          total={pager.total}
          onPageChange={pager.setPage}
        />
      )}
    </div>
  );
}
