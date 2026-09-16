import { Router } from 'express';
import { z } from 'zod';
import { ROUTE } from '../constants/routes.ts';
import { loginAsDevUser, loginWithGoogle } from '../services/authService.ts';

const googleLoginSchema = z.object({ idToken: z.string().min(1) });
const devLoginSchema = z.object({ email: z.email() });

export const authRoutes = Router();

authRoutes.post(ROUTE.AUTH_GOOGLE, async (req, res) => {
  const body = googleLoginSchema.parse(req.body);
  req.body = body;

  const result = await loginWithGoogle(body.idToken);
  res.status(200).json(result);
});

authRoutes.post(ROUTE.AUTH_DEV_LOGIN, async (req, res) => {
  const body = devLoginSchema.parse(req.body);
  req.body = body;

  const result = await loginAsDevUser(body.email);
  res.status(200).json(result);
});
