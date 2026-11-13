import { useId } from "react";
import { Button, Select } from "flowbite-react";
import { getPageMeta } from "@/utils/pagination";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export default function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
}: TablePaginationProps) {
  const pageSizeId = useId();
  const meta = getPageMeta(total, page, pageSize);
  const hasPages = meta.pageCount > 1;

  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-slate-800 px-4 py-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium">
        Mostrando {meta.from}–{meta.to} de {meta.total}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <label htmlFor={pageSizeId}>Por página</label>
            <Select
              id={pageSizeId}
              sizing="sm"
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="w-20"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        )}
        {hasPages && (
          <>
            <Button
              size="xs"
              color="gray"
              disabled={meta.page === 0}
              onClick={() => onPageChange(meta.page - 1)}
            >
              Anterior
            </Button>
            <span className="min-w-14 text-center font-mono">
              {meta.page + 1} / {meta.pageCount}
            </span>
            <Button
              size="xs"
              color="gray"
              disabled={meta.page + 1 >= meta.pageCount}
              onClick={() => onPageChange(meta.page + 1)}
            >
              Siguiente
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
