
import { Tenant, User, Subscription } from '../models/index.js';
import { sequelize } from '../config/database.js';

export class AdminController {
  static async getGlobalStats(req, res) {
    try {
      const totalTenants = await Tenant.count();
      const activeTenants = await Tenant.count({ where: { isActive: true } });
      const mrr = await Tenant.sum('mrr', { where: { isActive: true } });

      return res.status(200).json({
        totalTenants,
        activeTenants,
        totalMrr: mrr || 0,
        systemHealth: 'OPTIMAL'
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async toggleTenantStatus(req, res) {
    try {
      const { id } = req.params;
      const tenant = await Tenant.findByPk(id);
      if (!tenant) return res.status(404).json({ error: 'Tenant non trouvé' });

      await tenant.update({ isActive: !tenant.isActive });
      return res.status(200).json(tenant);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
