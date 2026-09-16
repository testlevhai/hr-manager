import type { ErrorRequestHandler } from 'express';
import { z, ZodError } from 'zod';
import { ERROR_CODE } from './constants/errorCodes.ts';
import { STRINGS } from './constants/strings.ts';

export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: { code: ERROR_CODE.VALIDATION_ERROR, message: z.prettifyError(error) },
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: { code: ERROR_CODE.INTERNAL_ERROR, message: STRINGS.INTERNAL_ERROR },
  });
};
