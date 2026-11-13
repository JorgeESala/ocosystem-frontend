import { useEffect, useMemo, useState } from "react";
import { getPageMeta, paginateItems } from "@/utils/pagination";

interface Options {
  pageSize?: number;
  resetKey?: unknown;
}

export const useClientPagination = <T>(
  items: T[],
  { pageSize: initialPageSize = 25, resetKey }: Options = {},
) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const meta = getPageMeta(items.length, page, pageSize);

  useEffect(() => {
    setPage(0);
  }, [resetKey, pageSize]);

  useEffect(() => {
    if (page !== meta.page) {
      setPage(meta.page);
    }
  }, [meta.page, page]);

  const pageItems = useMemo(
    () => paginateItems(items, page, pageSize),
    [items, page, pageSize],
  );

  return {
    ...meta,
    pageItems,
    setPage,
    setPageSize,
  };
};
