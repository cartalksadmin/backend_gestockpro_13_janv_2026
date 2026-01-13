import { Tenant, Subscription } from '../models/index.js';
import { StripeService } from '../services/StripeService.js';

export class PaymentController {
  static async handleWebhook(req, res) {
    let provider, status, tenantId, amount, transactionId, planId;

    try {
      // Detect Stripe webhook by signature header
      const stripeSig = req.headers['stripe-signature'];
      if (stripeSig && process.env.STRIPE_WEBHOOK_SECRET) {
        // req.body is raw Buffer because server registers express.raw for this route
        const event = StripeService.constructEvent(req.body, stripeSig);
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          provider = 'STRIPE';
          status = 'SUCCESS';
          tenantId = session.metadata?.tenantId;
          planId = session.metadata?.planId;
          transactionId = session.id;
          amount = (session.amount_total || 0) / 100;
        } else {
          // Ignore other Stripe events for now
          return res.status(200).send('Ignored');
        }
      } else {
        // Generic aggregator webhook: body may be Buffer or parsed JSON
        let payload = req.body;
        if (Buffer.isBuffer(payload)) {
          try { payload = JSON.parse(payload.toString()); } catch (e) { /* leave as-is */ }
        }
        ({ provider, status, tenantId, amount, transactionId, planId } = payload || {});
      }

      const tenant = await Tenant.findByPk(tenantId);
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

      if (status === 'SUCCESS') {
        await tenant.update({ 
          isActive: true, 
          paymentStatus: 'UP_TO_DATE',
          lastPaymentDate: new Date()
        });

        const sub = await Subscription.findOne({ where: { tenantId } });
        if (sub) {
          const nextBilling = new Date();
          nextBilling.setMonth(nextBilling.getMonth() + 1);
          await sub.update({ 
            status: 'ACTIVE', 
            planId: planId || sub.planId,
            nextBillingDate: nextBilling 
          });
        }

        console.log(`✅ Payment ${transactionId} confirmed (${provider}) for ${tenant.name}`);
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('Payment webhook error', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}
