export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
}
export enum JobPosition {
  DRIVER = "DRIVER",
  BRANCH_MANAGER = "BRANCH_MANAGER",
  OFFICE = "OFFICE",
  ADMIN = "ADMIN",
}
