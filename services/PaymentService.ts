
import axios from 'axios';
import { Tenant } from '../models/Tenant';

export class PaymentService {
  /**
   * n8n Relance Webhook
   */
  static async triggerN8NRelance(tenantId: string, invoiceId: string) {
    const webhookUrl = process.env.N8N_RELANCE_URL;
    if (!webhookUrl) return;

    try {
      await axios.post(webhookUrl, { tenantId, invoiceId, timestamp: new Date() });
    } catch (e) {
      console.error('n8n Relance failed');
    }
  }

  /**
   * Gère les callbacks multi-providers
   */
  static async processPaymentCallback(payload: any) {
    const { tenantId, amount, status, provider } = payload;
    
    if (status === 'SUCCESS') {
      const tenant = await (Tenant as any).findByPk(tenantId);
      if (tenant) {
        await tenant.update({ 
          isActive: true, 
          paymentStatus: 'UP_TO_DATE',
          lastPaymentDate: new Date()
        });
        return true;
      }
    }
    return false;
  }
}
