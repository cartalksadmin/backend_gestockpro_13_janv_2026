
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'GESTOCK_KERNEL_2024';

export const authenticateJWT = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return (res as any).status(401).json({ 
      error: 'Authentication Required',
      message: 'Token de sécurité manquant dans les en-têtes.' 
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET, (err: any, user: any) => {
    if (err) {
      const message = err.name === 'TokenExpiredError' ? 'Session expirée' : 'Token invalide';
      return (res as any).status(403).json({ error: 'Forbidden', message });
    }
    
    req.user = user;
    next();
  });
};
