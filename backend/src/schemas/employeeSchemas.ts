import { z } from 'zod';
import { employmentStatusSchema, employmentTypeSchema } from '../constants/employment.ts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/pagination.ts';

export const employeeIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const employeeInputSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.email().max(255),
  phone: z.string().trim().min(1).max(40),
  dateOfBirth: z.iso.date(),
  jobTitle: z.string().trim().min(1).max(120),
  departmentId: z.number().int().positive(),
  managerId: z.number().int().positive().nullable(),
  startDate: z.iso.date(),
  employmentType: employmentTypeSchema,
  employmentStatus: employmentStatusSchema,
  salary: z.number().nonnegative(),
});

export const employeeListQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  status: employmentStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
