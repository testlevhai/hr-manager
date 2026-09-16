import { apiRequest } from './client';
import { API_PATH } from '@/constants/apiPaths';
import type { Department } from '@/types/employee';

export const fetchDepartments = async (
  token: string | null,
  signal: AbortSignal,
): Promise<{ items: Department[] }> =>
  apiRequest<{ items: Department[] }>(API_PATH.DEPARTMENTS, { token, signal });
