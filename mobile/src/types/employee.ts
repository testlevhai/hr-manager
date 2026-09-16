export type Department = {
  id: number;
  name: string;
};

export type ManagerSummary = {
  id: number;
  firstName: string;
  lastName: string;
};

export type EmployeeListItem = {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  departmentName: string;
  employmentStatus: string;
};

export type EmployeeDetail = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  jobTitle: string;
  department: Department;
  manager: ManagerSummary | null;
  startDate: string;
  employmentType: string;
  employmentStatus: string;
  salary: number;
};

export type EmployeeInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  jobTitle: string;
  departmentId: number;
  managerId: number | null;
  startDate: string;
  employmentType: string;
  employmentStatus: string;
  salary: number;
};
