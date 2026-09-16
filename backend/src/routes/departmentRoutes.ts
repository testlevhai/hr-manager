import { Router } from 'express';
import { ROUTE } from '../constants/routes.ts';
import { listDepartments } from '../db/departmentsDb.ts';

export const departmentRoutes = Router();

departmentRoutes.get(ROUTE.ROOT, async (_req, res) => {
  const items = await listDepartments();
  res.status(200).json({ items });
});
