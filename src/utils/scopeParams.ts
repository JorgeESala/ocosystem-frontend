import { toLocalDateString } from "./date.utils";

export const SCOPE_PARAM_BRANCHES = "branches";
export const SCOPE_PARAM_BRANCH = "branch";
export const SCOPE_PARAM_START = "start";
export const SCOPE_PARAM_END = "end";
export const SCOPE_PARAM_DATE = "date";

export interface DashboardScope {
  branchIds: number[];
  start: Date | null;
  end: Date | null;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseDateParam = (value: string | null): Date | null => {
  if (!value) return null;
  const match = DATE_PATTERN.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

export const parseScopeParams = (
  searchParams: URLSearchParams,
  knownBranchIds: number[],
): DashboardScope => {
  const rawIds = (searchParams.get(SCOPE_PARAM_BRANCHES) ?? "")
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
  const known = new Set(knownBranchIds);
  const branchIds = rawIds.filter((id) => known.has(id));

  let start = parseDateParam(searchParams.get(SCOPE_PARAM_START));
  let end = parseDateParam(searchParams.get(SCOPE_PARAM_END));
  if (start && end && start.getTime() > end.getTime()) {
    start = null;
    end = null;
  }
  return { branchIds, start, end };
};

export const buildScopeSearch = (
  branchIds: number[],
  start: Date,
  end: Date,
): string => {
  const params = new URLSearchParams();
  params.append(SCOPE_PARAM_BRANCHES, branchIds.join(","));
  params.append(SCOPE_PARAM_START, toLocalDateString(start));
  params.append(SCOPE_PARAM_END, toLocalDateString(end));
  return params.toString();
};
