export const APP_ROUTE: {
  LOGIN: '/login';
  EMPLOYEES: '/employees';
  NEW_EMPLOYEE: '/employees/new';
} = {
  LOGIN: '/login',
  EMPLOYEES: '/employees',
  NEW_EMPLOYEE: '/employees/new',
};

export const employeeRoute = (employeeId: number): `/employees/${number}` =>
  `/employees/${employeeId}`;

export const editEmployeeRoute = (employeeId: number): `/employees/${number}/edit` =>
  `/employees/${employeeId}/edit`;

export const employeeTimelineRoute = (employeeId: number): `/employees/${number}/timeline` =>
  `/employees/${employeeId}/timeline`;

export const newTimelineEntryRoute = (
  employeeId: number,
): `/employees/${number}/timeline/new` => `/employees/${employeeId}/timeline/new`;
