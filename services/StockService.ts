
import { StockItem } from '../models/StockItem';
import { ProductMovement } from '../models/ProductMovement';
import { sequelize } from '../config/database';
import axios from 'axios';

export class StockService {
  static async recordMovement(data: any, transaction?: any) {
    const { tenantId, productId, type, qty, reason, userId } = data;
    
    return await (ProductMovement as any).create({
      tenantId, productId, type, qty, reason, userId
    }, { transaction });
  }

  static async checkThresholds(tenantId: string, productId: string) {
    const product = await (StockItem as any).findByPk(productId);
    if (product && product.currentLevel <= product.minThreshold) {
      // Déclencher alerte via NotificationService
      return true;
    }
    return false;
  }

  /**
   * Interface avec n8n pour les prévisions IA
   */
  static async getAIForecast(sku: string, history: any[]) {
    const n8nUrl = process.env.N8N_AI_FORECAST_URL;
    if (!n8nUrl) return null;

    try {
      const response = await axios.post(n8nUrl, { sku, history });
      return response.data;
    } catch (e) {
      console.error('AI Forecast failed');
      return null;
    }
  }
}
