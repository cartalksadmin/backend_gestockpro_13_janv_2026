
import { AuditLog } from '../models/index.js';
import { SecurityService } from '../services/SecurityService.js';

export class SecurityController {
  /**
   * Récupère le journal d'audit filtré par tenant
   */
  static async getAuditTrail(req, res) {
    try {
      const logs = await AuditLog.findAll({
        where: { tenantId: req.user.tenantId },
        order: [['createdAt', 'DESC']],
        limit: 100
      });
      return res.status(200).json(logs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Déclenche une vérification d'intégrité sur tout le tenant
   */
  static async checkTenantIntegrity(req, res) {
    try {
      const logs = await AuditLog.findAll({
        where: { tenantId: req.user.tenantId }
      });

      let corruptedCount = 0;
      for (const log of logs) {
        const isValid = await SecurityService.verifyLogIntegrity(log.id);
        if (!isValid) corruptedCount++;
      }

      return res.status(200).json({
        status: corruptedCount === 0 ? 'SECURE' : 'COMPROMISED',
        totalLogs: logs.length,
        corruptedLogs: corruptedCount,
        timestamp: new Date()
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
