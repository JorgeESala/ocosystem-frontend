import { JobPosition } from "../types";

export const employeesKeys = {
  all: ["employees"] as const,

  lists: () => [...employeesKeys.all, "list"] as const,

  listByPosition: (position?: JobPosition) =>
    position
      ? ([...employeesKeys.lists(), "position", position] as const)
      : employeesKeys.lists(),

  detail: (id: number) => [...employeesKeys.all, "detail", id] as const,
};
