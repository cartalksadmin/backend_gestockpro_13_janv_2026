
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'GESTOCK_KERNEL_SECURE_2024_@PRIV';

export class AuthService {
  /**
   * Valide les identifiants email/password via bcrypt
   */
  static async validateCredentials(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
  }

  /**
   * Génère un token JWT contenant le payload d'isolation (tenantId)
   */
  static generateToken(user) {
    // Le payload contient l'ID utilisateur, l'ID du Tenant et son rôle
    return jwt.sign(
      { 
        id: user.id, 
        tenantId: user.tenantId, 
        role: user.role,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Session de 24 heures
    );
  }

  /**
   * Décodage et vérification du token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
}
