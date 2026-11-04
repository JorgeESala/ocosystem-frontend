const HIDE_EMPTY_ON_PRINT_KEY = "route-orders:hide-empty-on-print";

export const loadHideEmptyOnPrint = (): boolean => {
  try {
    return window.localStorage.getItem(HIDE_EMPTY_ON_PRINT_KEY) === "true";
  } catch {
    return false;
  }
};

export const saveHideEmptyOnPrint = (value: boolean): void => {
  try {
    window.localStorage.setItem(HIDE_EMPTY_ON_PRINT_KEY, String(value));
  } catch {
    return;
  }
};
