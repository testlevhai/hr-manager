import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.ts';
import { AppError } from '../errors.ts';
import { ERROR_CODE } from '../constants/errorCodes.ts';
import { STRINGS } from '../constants/strings.ts';

const BEARER_PREFIX = 'Bearer ';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, STRINGS.MISSING_AUTH_TOKEN);
  }

  try {
    const payload = jwt.verify(header.slice(BEARER_PREFIX.length), env.JWT_SECRET);
    if (typeof payload === 'string' || !payload.sub) {
      throw new Error();
    }
    req.authUser = {
      id: Number(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, STRINGS.INVALID_AUTH_TOKEN);
  }

  next();
};
