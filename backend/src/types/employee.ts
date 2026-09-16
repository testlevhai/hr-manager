import type { EmploymentStatus, EmploymentType } from '../constants/employment.ts';

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
  employmentStatus: EmploymentStatus;
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
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  salary: number;
};
