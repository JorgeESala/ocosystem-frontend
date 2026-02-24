import type { Category } from "@/services/api";
import { http } from "@/shared/api/http";

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await http.get("/api/categories");
  return data;
};

export const createCategory = async (payload: {
  name: string;
}): Promise<Category> => {
  const { data } = await http.post("/api/categories", payload);
  return data;
};

export const updateCategory = async (
  id: number,
  payload: { name: string },
): Promise<Category> => {
  const { data } = await http.put(`/api/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await http.delete(`/api/categories/${id}`);
};
