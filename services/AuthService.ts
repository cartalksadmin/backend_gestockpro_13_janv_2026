
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'GESTOCK_KERNEL_2024';

export class AuthService {
  static async validateCredentials(email: string, password: string) {
    const user = await (User as any).findOne({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
  }

  static generateToken(user: User) {
    return jwt.sign(
      { id: user.id, tenantId: user.tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Simulation MFA - Envoi de code via NotificationService
  static async initiateMFA(user: User) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Logique de stockage temporaire du code (Redis ou table temporaire)
    return code;
  }
}
