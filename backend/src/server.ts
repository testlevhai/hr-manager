import express from 'express';
import cors from 'cors';
import { env } from './env.ts';
import { pool } from './db/pool.ts';
import { errorHandler } from './errors.ts';
import { ROUTE } from './constants/routes.ts';
import { authRoutes } from './routes/authRoutes.ts';
import { departmentRoutes } from './routes/departmentRoutes.ts';
import { employeeRoutes } from './routes/employeeRoutes.ts';
import { timelineRoutes } from './routes/timelineRoutes.ts';
import { requireAuth } from './middleware/authMiddleware.ts';

const app = express();

app.use(cors());
app.use(express.json());

app.get(ROUTE.HEALTH, async (_req, res) => {
  await pool.query('SELECT 1');
  res.status(200).json({ ok: true });
});

app.use(ROUTE.AUTH, authRoutes);
app.use(ROUTE.DEPARTMENTS, requireAuth, departmentRoutes);
app.use(ROUTE.EMPLOYEE_TIMELINE, requireAuth, timelineRoutes);
app.use(ROUTE.EMPLOYEES, requireAuth, employeeRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
