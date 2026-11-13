export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  from: number;
  to: number;
}

export const getPageMeta = (
  total: number,
  page: number,
  pageSize: number,
): PageMeta => {
  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(0, page), pageCount - 1);
  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    pageCount,
    from: total === 0 ? 0 : safePage * safePageSize + 1,
    to: Math.min(total, (safePage + 1) * safePageSize),
  };
};

export const paginateItems = <T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] => {
  const meta = getPageMeta(items.length, page, pageSize);
  return items.slice(meta.page * meta.pageSize, meta.to);
};
