import { apiRequest } from './client';
import { employeeTimelinePath } from '@/constants/apiPaths';
import { HTTP_METHOD } from '@/constants/http';
import type { TimelineEntry, TimelineEntryInput } from '@/types/timeline';
import type { Paginated } from '@/types/pagination';

export const fetchTimeline = async (
  employeeId: number,
  token: string | null,
  signal: AbortSignal,
): Promise<Paginated<TimelineEntry>> =>
  apiRequest<Paginated<TimelineEntry>>(employeeTimelinePath(employeeId), { token, signal });

export const createTimelineEntry = async (
  employeeId: number,
  input: TimelineEntryInput,
  token: string | null,
): Promise<TimelineEntry> =>
  apiRequest<TimelineEntry>(employeeTimelinePath(employeeId), {
    method: HTTP_METHOD.POST,
    body: input,
    token,
  });
