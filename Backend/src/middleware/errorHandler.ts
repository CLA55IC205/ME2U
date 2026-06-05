import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors.js';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.flatten(),
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
  });
}
