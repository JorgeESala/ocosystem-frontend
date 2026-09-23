import { useMemo } from "react";
import { useEmployees } from "@/features/employee/api/employees.queries";

export const useEmployeeNames = (): Map<number, string> => {
  const { data: employees = [] } = useEmployees();

  return useMemo(() => {
    const names = new Map<number, string>();
    for (const employee of employees) {
      names.set(employee.id, employee.name);
    }
    return names;
  }, [employees]);
};

export const resolveEmployeeName = (
  names: Map<number, string>,
  id: number | null | undefined,
): string => {
  if (id == null) {
    return "Sistema";
  }
  return names.get(id) ?? `#${id}`;
};
