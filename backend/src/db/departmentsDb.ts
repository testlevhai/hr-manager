import { pool } from './pool.ts';
import type { Department } from '../types/employee.ts';

export const listDepartments = async (): Promise<Department[]> => {
  const result = await pool.query<Department>('SELECT id, name FROM departments ORDER BY name');
  return result.rows;
};

export const departmentExists = async (departmentId: number): Promise<boolean> => {
  const result = await pool.query('SELECT 1 FROM departments WHERE id = $1', [departmentId]);
  return result.rowCount === 1;
};
