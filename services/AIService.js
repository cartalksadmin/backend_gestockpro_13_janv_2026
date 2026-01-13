
import { StockItem, ProductMovement } from '../models/index.js';
import { Op } from 'sequelize';
import axios from 'axios';

export class AIService {
  /**
   * Analyse la vélocité d'un produit (ventes moyennes par jour)
   */
  static async calculateVelocity(tenantId, productId, days = 30) {
    const movements = await ProductMovement.findAll({
      where: {
        tenantId,
        productId,
        type: 'OUT',
        createdAt: { [Op.gt]: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      }
    });

    const totalOut = movements.reduce((sum, m) => sum + m.qty, 0);
    return totalOut / days;
  }

  /**
   * Prédit la date de rupture de stock (ETA)
   */
  static async predictStockOut(tenantId, productId) {
    const product = await StockItem.findOne({ where: { id: productId, tenantId } });
    const velocity = await this.calculateVelocity(tenantId, productId);

    if (velocity <= 0) return null; // Pas de mouvement sortant

    const daysRemaining = Math.floor(product.currentLevel / velocity);
    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + daysRemaining);

    return {
      daysRemaining,
      etaDate,
      velocity
    };
  }

  /**
   * Synchronisation avec le webhook n8n pour analyse LLM avancée
   */
  static async triggerN8NAnalysis(tenantId, data) {
    const N8N_WEBHOOK = process.env.N8N_AI_ORCHESTRATOR_URL;
    if (!N8N_WEBHOOK) return;

    try {
      await axios.post(N8N_WEBHOOK, {
        tenantId,
        timestamp: new Date(),
        payload: data
      });
    } catch (error) {
      console.error('[IA-KERNEL] n8n Bridge Error:', error.message);
    }
  }
}
