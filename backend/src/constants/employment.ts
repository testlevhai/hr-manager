import { z } from 'zod';

export const employmentTypeSchema = z.enum(['Full Time', 'Part Time', 'Contractor']);
export const employmentStatusSchema = z.enum(['Active', 'On Leave', 'Terminated']);

export type EmploymentType = z.infer<typeof employmentTypeSchema>;
export type EmploymentStatus = z.infer<typeof employmentStatusSchema>;
