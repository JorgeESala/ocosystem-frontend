import { http } from "@/shared/api/http";
import { Employee, JobPosition } from "../types";

export interface GetEmployeesParams {
  position?: JobPosition;
}

export const getEmployees = async (
  params?: GetEmployeesParams,
): Promise<Employee[]> => {
  const response = await http.get<Employee[]>("/api/employees", {
    params,
  });

  return response.data;
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
  const response = await http.get<Employee>(`/api/employees/${id}`);
  return response.data;
};
export const driverApi = {
  getDrivers: async (): Promise<Employee[]> => {
    const { data } = await http.get("/api/employees", {
      params: { position: JobPosition.DRIVER },
    });
    return data;
  },
};
