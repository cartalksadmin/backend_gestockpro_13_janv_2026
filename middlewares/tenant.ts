
import { Response, NextFunction } from 'express';

/**
 * Garantit que chaque requête est filtrée par l'ID du Tenant de l'utilisateur.
 * Empêche les fuites de données transversales (Insecure Direct Object Reference).
 */
export const tenantIsolation = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return (res as any).status(401).json({ error: 'Auth context missing' });
  }

  const tenantId = req.user.tenantId;

  // Le SuperAdmin peut naviguer entre les tenants si spécifié, 
  // sinon on utilise son tenant par défaut.
  if (req.user.role === 'SUPER_ADMIN') {
    const targetTenant = req.headers['x-tenant-id'] || tenantId;
    req.tenantFilter = { tenantId: targetTenant };
  } else {
    if (!tenantId) {
      return (res as any).status(403).json({ error: 'Missing Tenant Identity' });
    }
    req.tenantFilter = { tenantId };
  }

  next();
};
