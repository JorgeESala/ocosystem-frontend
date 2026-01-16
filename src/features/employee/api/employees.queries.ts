// features/employees/employees.queries.ts
import { useQuery } from "@tanstack/react-query";
import { getEmployees, getEmployeeById, driverApi } from "./employees.api";
import { employeesKeys } from "./employees.keys";
import { JobPosition } from "../types";

export const useEmployees = (position?: JobPosition) => {
  return useQuery({
    queryKey: employeesKeys.listByPosition(position),
    queryFn: () => getEmployees({ position }),
  });
};

export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: employeesKeys.detail(id),
    queryFn: () => getEmployeeById(id),
    enabled: !!id,
  });
};
export const useDrivers = () =>
  useQuery({
    queryKey: ["employees", "drivers"],
    queryFn: driverApi.getDrivers,
  });
