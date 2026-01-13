
import { Plan, Subscription, Tenant } from '../models/index.js';
import { PaymentGateway } from '../services/PaymentGateway.js';

export class SubscriptionController {
  /**
   * Récupère tous les plans actifs depuis PostgreSQL AlwaysData
   */
  static async listPlans(req, res) {
    try {
      // On récupère les plans directement depuis la table 'plans'
      const dbPlans = await Plan.findAll({
        where: { isActive: true },
        order: [['priceMonthly', 'ASC']]
      });
      
      // Si la base est vide, on renvoie les plans par défaut pour ne pas bloquer l'UI, 
      // mais l'objectif est d'utiliser dbPlans.
      if (!dbPlans || dbPlans.length === 0) {
        // Fallback optionnel si la table est vide lors du premier test
        return res.status(200).json([
          { id: 'BASIC', name: 'Starter AI', price: 49, maxUsers: 1, hasAiChatbot: false },
          { id: 'PRO', name: 'Business Pro', price: 129, maxUsers: 5, hasAiChatbot: true, isPopular: true },
          { id: 'ENTERPRISE', name: 'Enterprise Cloud', price: 399, maxUsers: 100, hasAiChatbot: true }
        ]);
      }

      // Formatage pour le frontend
      const formattedPlans = dbPlans.map(p => ({
        id: p.id,
        name: p.name,
        price: p.priceMonthly,
        maxUsers: p.maxUsers,
        hasAiChatbot: p.hasAiChatbot,
        hasStockForecast: p.hasStockForecast,
        isPopular: p.id === 'PRO' // Logique métier simple pour le badge
      }));

      return res.status(200).json(formattedPlans);
    } catch (error) {
      console.error('❌ Database Fetch Error (Plans):', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des plans depuis le Kernel.' });
    }
  }

  static async subscribe(req, res) {
    try {
      const { planId, paymentMethod } = req.body;
      const tenantId = req.user.tenantId;

      const plan = await Plan.findByPk(planId);
      if (!plan) return res.status(404).json({ error: 'Plan non trouvé' });

      const payment = await PaymentGateway.initializePayment(paymentMethod, plan.priceMonthly, 'EUR', { tenantId, planId });

      return res.status(200).json(payment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
