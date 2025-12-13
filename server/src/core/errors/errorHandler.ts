import { NextFunction, Request, Response } from 'express';
import { AppError } from './AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const e = err as AppError;
  const status = e?.status || 500;
  const message = e?.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
}
