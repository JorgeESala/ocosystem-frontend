import { useEffect, useState } from "react";

export const CHICKEN_CATEGORY_ID = 1;
export const EGG_CATEGORY_IDS = [7, 8, 9];

const HIDE_CHICKEN_KEY = "reports-hide-chicken";
const HIDE_EGG_KEY = "reports-hide-egg";

export const isChickenCategory = (
  categoryId?: number | null,
  categoryName?: string | null,
): boolean =>
  categoryId === CHICKEN_CATEGORY_ID ||
  (categoryName?.trim() ?? "").toLowerCase() === "pollo";

export const isEggCategory = (
  categoryId?: number | null,
  categoryName?: string | null,
): boolean =>
  (categoryId != null && EGG_CATEGORY_IDS.includes(categoryId)) ||
  /^huevo/i.test((categoryName ?? "").trim());

export const filterTopProducts = <
  T extends { categoryId?: number | null; categoryName?: string | null },
>(
  products: T[],
  hideChicken: boolean,
  hideEgg: boolean,
): T[] =>
  products.filter((product) => {
    if (
      hideChicken &&
      isChickenCategory(product.categoryId, product.categoryName)
    ) {
      return false;
    }
    if (hideEgg && isEggCategory(product.categoryId, product.categoryName)) {
      return false;
    }
    return true;
  });

const readStoredFlag = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

export const useTopCategoryFilters = () => {
  const [hideChicken, setHideChicken] = useState(() =>
    readStoredFlag(HIDE_CHICKEN_KEY),
  );
  const [hideEgg, setHideEgg] = useState(() => readStoredFlag(HIDE_EGG_KEY));

  useEffect(() => {
    try {
      localStorage.setItem(HIDE_CHICKEN_KEY, String(hideChicken));
    } catch {
      // storage unavailable (private mode) - preference just won't persist
    }
  }, [hideChicken]);

  useEffect(() => {
    try {
      localStorage.setItem(HIDE_EGG_KEY, String(hideEgg));
    } catch {
      // storage unavailable (private mode) - preference just won't persist
    }
  }, [hideEgg]);

  return {
    hideChicken,
    hideEgg,
    setHideChicken,
    setHideEgg,
  };
};
