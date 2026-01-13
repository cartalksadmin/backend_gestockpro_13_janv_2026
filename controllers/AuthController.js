
import { AuthService } from '../services/AuthService.js';
import { User, Tenant, Subscription } from '../models/index.js';
import { sequelize } from '../config/database.js';

export class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.validateCredentials(email, password);

      if (!user) return res.status(401).json({ error: 'Identifiants invalides.' });
      if (!user.isActive) return res.status(403).json({ error: 'Compte désactivé.' });

      const token = AuthService.generateToken(user);
      return res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role, tenantId: user.tenantId } });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async register(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { email, password, companyName, domain, planId } = req.body;

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Email déjà utilisé.' });
      }

      // 1. Créer le Tenant (Instance isolée) avec les settings par défaut
      const tenant = await Tenant.create({
        name: companyName,
        domain: domain || `${Date.now()}.gestock.pro`,
        paymentStatus: planId === 'FREE_TRIAL' ? 'TRIAL' : 'PENDING',
        taxRate: 18.00,
        currency: 'F CFA'
      }, { transaction });

      // 2. Créer l'administrateur
      const user = await User.create({
        email,
        password,
        name: `Admin ${companyName}`,
        role: 'ADMIN',
        tenantId: tenant.id
      }, { transaction });

      // 3. Lier au Plan SQL
      await Subscription.create({
        tenantId: tenant.id,
        planId: planId || 'FREE_TRIAL',
        status: 'TRIAL',
        nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }, { transaction });

      await transaction.commit();
      const token = AuthService.generateToken(user);

      return res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role, tenantId: user.tenantId } });
    } catch (error) {
      if (transaction) await transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  }
}
