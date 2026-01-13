
/**
 * Middleware de protection RBAC (Role-Based Access Control)
 * @param {string[]} allowedRoles - Rôles autorisés à franchir ce point
 */
export const checkPermission = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        error: 'SecurityError', 
        message: 'Accès non authentifié.' 
      });
    }

    // Le SUPER_ADMIN a un accès universel (Maintenance Kernel)
    if (user.role === 'SUPER_ADMIN') return next();

    // Vérification de l'appartenance au rôle
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'AccessDenied', 
        message: `Votre rôle (${user.role}) n'autorise pas cette opération.` 
      });
    }

    next();
  };
};

/**
 * Définit les niveaux de privilèges standard de GeStockPro
 */
export const ROLES = {
  ADMIN: 'ADMIN',       // Gestion complète du tenant
  MANAGER: 'MANAGER',   // Stocks et rapports
  ACCOUNTANT: 'ACCOUNTANT', // Facturation et finances
  EMPLOYEE: 'EMPLOYEE'  // Consultations simples
};
