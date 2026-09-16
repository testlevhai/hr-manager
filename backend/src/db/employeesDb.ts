import { pool } from './pool.ts';
import type { EmployeeDetail, EmployeeListItem } from '../types/employee.ts';
import type { EmployeeInput, EmployeeListQuery } from '../schemas/employeeSchemas.ts';

const EMPLOYEE_DETAIL_SELECT = `
  SELECT
    e.id,
    e.first_name AS "firstName",
    e.last_name AS "lastName",
    e.email,
    e.phone,
    to_char(e.date_of_birth, 'YYYY-MM-DD') AS "dateOfBirth",
    e.job_title AS "jobTitle",
    json_build_object('id', d.id, 'name', d.name) AS department,
    CASE
      WHEN m.id IS NULL THEN NULL
      ELSE json_build_object('id', m.id, 'firstName', m.first_name, 'lastName', m.last_name)
    END AS manager,
    to_char(e.start_date, 'YYYY-MM-DD') AS "startDate",
    e.employment_type AS "employmentType",
    e.employment_status AS "employmentStatus",
    e.salary::float8 AS salary
  FROM employees e
  JOIN departments d ON d.id = e.department_id
  LEFT JOIN employees m ON m.id = e.manager_id
`;

const buildListFilters = (query: EmployeeListQuery) => {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.search) {
    params.push(`%${query.search}%`);
    conditions.push(`lower(e.first_name || ' ' || e.last_name) LIKE lower($${params.length})`);
  }

  if (query.departmentId) {
    params.push(query.departmentId);
    conditions.push(`e.department_id = $${params.length}`);
  }

  if (query.status) {
    params.push(query.status);
    conditions.push(`e.employment_status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
};

export const listEmployees = async (
  query: EmployeeListQuery,
): Promise<{ items: EmployeeListItem[]; total: number }> => {
  const { whereClause, params } = buildListFilters(query);

  const countResult = await pool.query<{ total: string }>(
    `SELECT count(*) AS total FROM employees e ${whereClause}`,
    params,
  );

  const itemsResult = await pool.query<EmployeeListItem>(
    `SELECT
       e.id,
       e.first_name AS "firstName",
       e.last_name AS "lastName",
       e.job_title AS "jobTitle",
       d.name AS "departmentName",
       e.employment_status AS "employmentStatus"
     FROM employees e
     JOIN departments d ON d.id = e.department_id
     ${whereClause}
     ORDER BY e.last_name, e.first_name, e.id
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, query.pageSize, (query.page - 1) * query.pageSize],
  );

  return { items: itemsResult.rows, total: Number(countResult.rows[0]!.total) };
};

export const getEmployeeById = async (employeeId: number): Promise<EmployeeDetail | null> => {
  const result = await pool.query<EmployeeDetail>(`${EMPLOYEE_DETAIL_SELECT} WHERE e.id = $1`, [
    employeeId,
  ]);
  return result.rows[0] ?? null;
};

export const employeeExists = async (employeeId: number): Promise<boolean> => {
  const result = await pool.query('SELECT 1 FROM employees WHERE id = $1', [employeeId]);
  return result.rowCount === 1;
};

export const insertEmployee = async (input: EmployeeInput): Promise<number> => {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO employees (
       first_name, last_name, email, phone, date_of_birth, job_title,
       department_id, manager_id, start_date, employment_type, employment_status, salary
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      input.dateOfBirth,
      input.jobTitle,
      input.departmentId,
      input.managerId,
      input.startDate,
      input.employmentType,
      input.employmentStatus,
      input.salary,
    ],
  );

  return result.rows[0]!.id;
};

export const updateEmployee = async (employeeId: number, input: EmployeeInput): Promise<void> => {
  await pool.query(
    `UPDATE employees SET
       first_name = $1,
       last_name = $2,
       email = $3,
       phone = $4,
       date_of_birth = $5,
       job_title = $6,
       department_id = $7,
       manager_id = $8,
       start_date = $9,
       employment_type = $10,
       employment_status = $11,
       salary = $12,
       updated_at = now()
     WHERE id = $13`,
    [
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      input.dateOfBirth,
      input.jobTitle,
      input.departmentId,
      input.managerId,
      input.startDate,
      input.employmentType,
      input.employmentStatus,
      input.salary,
      employeeId,
    ],
  );
};
