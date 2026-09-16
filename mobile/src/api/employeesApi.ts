import { apiRequest } from './client';
import { API_PATH, employeePath } from '@/constants/apiPaths';
import { QUERY_PARAM } from '@/constants/queryParams';
import type { EmployeeDetail, EmployeeListItem } from '@/types/employee';
import type { Paginated } from '@/types/pagination';

type FetchEmployeesParams = {
  search: string;
  page: number;
  pageSize: number;
};

export const fetchEmployees = async (
  params: FetchEmployeesParams,
  token: string | null,
  signal: AbortSignal,
): Promise<Paginated<EmployeeListItem>> => {
  const queryParts = [
    `${QUERY_PARAM.PAGE}=${params.page}`,
    `${QUERY_PARAM.PAGE_SIZE}=${params.pageSize}`,
  ];

  if (params.search) {
    queryParts.push(`${QUERY_PARAM.SEARCH}=${encodeURIComponent(params.search)}`);
  }

  return apiRequest<Paginated<EmployeeListItem>>(
    `${API_PATH.EMPLOYEES}?${queryParts.join('&')}`,
    { token, signal },
  );
};

export const fetchEmployee = async (
  employeeId: number,
  token: string | null,
  signal: AbortSignal,
): Promise<EmployeeDetail> =>
  apiRequest<EmployeeDetail>(employeePath(employeeId), { token, signal });
