
import { Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // Fix: cast res to any to resolve 'status' missing error in TypeScript
    if (!req.user) return (res as any).status(401).json({ error: 'Non authentifié' });

    if (allowedRoles.includes(req.user.role) || req.user.role === 'SUPER_ADMIN') {
      next();
    } else {
      // Fix: cast res to any to resolve 'status' missing error in TypeScript
      (res as any).status(403).json({ error: 'Accès refusé : Droits insuffisants' });
    }
  };
};