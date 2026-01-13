
import { Subscription } from '../models/Subscription';
import { Tenant } from '../models/Tenant';

export class SubscriptionService {
  static async canAccessFeature(tenantId: string, feature: string) {
    const tenant = await (Tenant as any).findByPk(tenantId);
    if (!tenant || !tenant.isActive) return false;

    const plan = tenant.plan;
    
    const featureMap: Record<string, string[]> = {
      'BASIC': ['STOCK_BASIC', 'BILLING_BASIC'],
      'PRO': ['STOCK_AI', 'BILLING_ADVANCED', 'CHATBOT'],
      'ENTERPRISE': ['STOCK_AI', 'BILLING_ADVANCED', 'CHATBOT', 'MULTI_ENTITY', 'CUSTOM_LLM']
    };

    return featureMap[plan]?.includes(feature) || false;
  }
}
