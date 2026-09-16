import { Router } from 'express';
import { ROUTE } from '../constants/routes.ts';
import {
  employeeIdParamSchema,
  employeeInputSchema,
  employeeListQuerySchema,
} from '../schemas/employeeSchemas.ts';
import {
  createEmployee,
  editEmployee,
  getEmployee,
  getEmployees,
} from '../services/employeeService.ts';

export const employeeRoutes = Router();

employeeRoutes.get(ROUTE.ROOT, async (req, res) => {
  const query = employeeListQuerySchema.parse(req.query);
  const result = await getEmployees(query);
  res.status(200).json(result);
});

employeeRoutes.get(ROUTE.BY_ID, async (req, res) => {
  const { id } = employeeIdParamSchema.parse(req.params);
  const employee = await getEmployee(id);
  res.status(200).json(employee);
});

employeeRoutes.post(ROUTE.ROOT, async (req, res) => {
  const body = employeeInputSchema.parse(req.body);
  req.body = body;

  const employee = await createEmployee(body);
  res.status(201).json(employee);
});

employeeRoutes.put(ROUTE.BY_ID, async (req, res) => {
  const { id } = employeeIdParamSchema.parse(req.params);
  const body = employeeInputSchema.parse(req.body);
  req.body = body;

  const employee = await editEmployee(id, body);
  res.status(200).json(employee);
});
