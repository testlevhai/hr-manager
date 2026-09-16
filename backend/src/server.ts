import express from 'express';
import cors from 'cors';
import { env } from './env.ts';
import { pool } from './db.ts';
import { errorHandler } from './errors.ts';
import { ROUTE } from './constants/routes.ts';

const app = express();

app.use(cors());
app.use(express.json());

app.get(ROUTE.HEALTH, async (_req, res) => {
  await pool.query('SELECT 1');
  res.status(200).json({ ok: true });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
