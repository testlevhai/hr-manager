export type EmployeeFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  jobTitle: string;
  departmentName: string;
  managerId: number | null;
  startDate: string;
  employmentType: string;
  employmentStatus: string;
  salary: string;
};

export type EmployeeFormErrors = Record<string, string>;
