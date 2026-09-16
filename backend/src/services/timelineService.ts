import { AppError } from '../errors.ts';
import { ERROR_CODE } from '../constants/errorCodes.ts';
import { STRINGS } from '../constants/strings.ts';
import { employeeExists } from '../db/employeesDb.ts';
import {
  getTimelineEntryById,
  insertTimelineEntry,
  listTimelineEntries,
} from '../db/timelineDb.ts';
import type { TimelineEntry } from '../types/timeline.ts';
import type { Paginated } from '../types/pagination.ts';
import type { TimelineEntryInput, TimelineListQuery } from '../schemas/timelineSchemas.ts';

const assertEmployeeExists = async (employeeId: number): Promise<void> => {
  if (!(await employeeExists(employeeId))) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, STRINGS.EMPLOYEE_NOT_FOUND);
  }
};

export const getEmployeeTimeline = async (
  employeeId: number,
  query: TimelineListQuery,
): Promise<Paginated<TimelineEntry>> => {
  await assertEmployeeExists(employeeId);

  const { items, total } = await listTimelineEntries(employeeId, query);
  return { items, page: query.page, pageSize: query.pageSize, total };
};

export const addTimelineEntry = async (
  employeeId: number,
  authorUserId: number,
  input: TimelineEntryInput,
): Promise<TimelineEntry> => {
  await assertEmployeeExists(employeeId);

  const entryId = await insertTimelineEntry(employeeId, authorUserId, input);
  const entry = await getTimelineEntryById(entryId);
  if (!entry) {
    throw new AppError(500, ERROR_CODE.INTERNAL_ERROR, STRINGS.INTERNAL_ERROR);
  }

  return entry;
};
