
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'GESTOCK_KERNEL_2024';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Authentication Required',
      message: 'Token de sécurité manquant.' 
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      const message = err.name === 'TokenExpiredError' ? 'Session expirée' : 'Token invalide';
      return res.status(403).json({ error: 'Forbidden', message });
    }
    
    req.user = user;
    next();
  });
};
