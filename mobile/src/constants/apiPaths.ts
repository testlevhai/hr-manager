export const API_PATH = {
  AUTH_GOOGLE: '/api/auth/google',
  AUTH_DEV_LOGIN: '/api/auth/dev-login',
  DEPARTMENTS: '/api/departments',
  EMPLOYEES: '/api/employees',
};

export const employeePath = (employeeId: number) => `${API_PATH.EMPLOYEES}/${employeeId}`;

export const employeeTimelinePath = (employeeId: number) =>
  `${API_PATH.EMPLOYEES}/${employeeId}/timeline`;
