
import { AIService } from '../services/AIService.js';
import { StockItem } from '../models/index.js';

export class AIController {
  /**
   * Récupère les insights IA pour le dashboard
   */
  static async getDashboardInsights(req, res) {
    try {
      const tenantId = req.user.tenantId;
      
      // Analyse des 5 produits les plus critiques
      const lowStocks = await StockItem.findAll({
        where: { tenantId },
        order: [['currentLevel', 'ASC']],
        limit: 5
      });

      const insights = [];
      for (const item of lowStocks) {
        const prediction = await AIService.predictStockOut(tenantId, item.id);
        if (prediction && prediction.daysRemaining < 7) {
          insights.push({
            productId: item.id,
            productName: item.name,
            sku: item.sku,
            message: `Risque de rupture dans ${prediction.daysRemaining} jours.`,
            severity: prediction.daysRemaining < 3 ? 'CRITICAL' : 'HIGH',
            velocity: prediction.velocity.toFixed(2)
          });
        }
      }

      return res.status(200).json({
        engine: 'Gemini-Flash-Native',
        timestamp: new Date(),
        insights
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Webhook de réception des prévisions calculées par n8n
   */
  static async updateForecasts(req, res) {
    try {
      const { predictions } = req.body; // Array of { sku: string, forecastedLevel: number }
      const tenantId = req.user.tenantId;

      for (const pred of predictions) {
        await StockItem.update(
          { forecastedLevel: pred.forecastedLevel },
          { where: { sku: pred.sku, tenantId } }
        );
      }

      return res.status(200).json({ status: 'SUCCESS', count: predictions.length });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
