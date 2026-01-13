
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[API ERROR] ${new Date().toISOString()}:`, err);

  const statusCode = err.status || 500;
  const message = err.message || 'Une erreur interne est survenue sur le Kernel GeStoc2.';

  // En production, on masque les détails sensibles
  const response = {
    error: err.name || 'InternalServerError',
    message: message,
    status: statusCode,
    timestamp: new Date().toISOString()
  };

  return (res as any).status(statusCode).json(response);
};
