import { z } from 'zod';
import { timelineEventTypeSchema } from '../constants/timeline.ts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/pagination.ts';

export const employeeIdRouteParamSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
});

export const timelineEntryInputSchema = z.object({
  eventType: timelineEventTypeSchema,
  eventDate: z.iso.date(),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(5000),
});

export const timelineListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type TimelineEntryInput = z.infer<typeof timelineEntryInputSchema>;
export type TimelineListQuery = z.infer<typeof timelineListQuerySchema>;
