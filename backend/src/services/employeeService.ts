import { AppError } from '../errors.ts';
import { ERROR_CODE } from '../constants/errorCodes.ts';
import { STRINGS } from '../constants/strings.ts';
import { PG_ERROR_CODE } from '../constants/pgErrorCodes.ts';
import { departmentExists } from '../db/departmentsDb.ts';
import {
  employeeExists,
  getEmployeeById,
  insertEmployee,
  listEmployees,
  updateEmployee,
} from '../db/employeesDb.ts';
import type { EmployeeDetail, EmployeeListItem } from '../types/employee.ts';
import type { Paginated } from '../types/pagination.ts';
import type { EmployeeInput, EmployeeListQuery } from '../schemas/employeeSchemas.ts';

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === PG_ERROR_CODE.UNIQUE_VIOLATION;

const assertReferencesExist = async (input: EmployeeInput): Promise<void> => {
  if (!(await departmentExists(input.departmentId))) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, STRINGS.DEPARTMENT_NOT_FOUND);
  }

  if (input.managerId !== null && !(await employeeExists(input.managerId))) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, STRINGS.MANAGER_NOT_FOUND);
  }
};

const requireEmployee = async (employeeId: number): Promise<EmployeeDetail> => {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, STRINGS.EMPLOYEE_NOT_FOUND);
  }
  return employee;
};

export const getEmployees = async (
  query: EmployeeListQuery,
): Promise<Paginated<EmployeeListItem>> => {
  const { items, total } = await listEmployees(query);
  return { items, page: query.page, pageSize: query.pageSize, total };
};

export const getEmployee = async (employeeId: number): Promise<EmployeeDetail> =>
  requireEmployee(employeeId);

export const createEmployee = async (input: EmployeeInput): Promise<EmployeeDetail> => {
  await assertReferencesExist(input);

  try {
    const employeeId = await insertEmployee(input);
    return await requireEmployee(employeeId);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(409, ERROR_CODE.CONFLICT, STRINGS.EMPLOYEE_EMAIL_TAKEN);
    }
    throw error;
  }
};

export const editEmployee = async (
  employeeId: number,
  input: EmployeeInput,
): Promise<EmployeeDetail> => {
  await requireEmployee(employeeId);

  if (input.managerId === employeeId) {
    throw new AppError(400, ERROR_CODE.VALIDATION_ERROR, STRINGS.MANAGER_CANNOT_BE_SELF);
  }

  await assertReferencesExist(input);

  try {
    await updateEmployee(employeeId, input);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(409, ERROR_CODE.CONFLICT, STRINGS.EMPLOYEE_EMAIL_TAKEN);
    }
    throw error;
  }

  return requireEmployee(employeeId);
};
