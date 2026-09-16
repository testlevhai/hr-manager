import { z } from 'zod';

export const timelineEventTypeSchema = z.enum([
  'Performance Review',
  'HR Meeting',
  'Salary Discussion',
  'Warning',
  'Promotion',
  'General Note',
]);

export type TimelineEventType = z.infer<typeof timelineEventTypeSchema>;
