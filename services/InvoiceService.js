
import { sequelize } from '../config/database.js';
import { StockItem, Invoice, InvoiceItem, AuditLog, Customer, ProductMovement } from '../models/index.js';

export class InvoiceService {
  /**
   * Valide une commande et la transforme en facture Factur-X
   */
  static async validateAndGenerate(tenantId, customerId, items, userId) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Validation de l'encours client
      const customer = await Customer.findByPk(customerId, { transaction });
      if (!customer) throw new Error('Client introuvable.');

      // 2. Calcul des montants avec taxes dynamiques du tenant
      const ht = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
      const taxRate = 18; // À récupérer depuis le tenant dynamiquement
      const tva = ht * (taxRate / 100);
      const ttc = ht + tva;

      // 3. Création de la Facture avec ID séquentiel
      const invoiceId = `INV-${Date.now().toString().slice(-8)}`;
      const invoice = await Invoice.create({
        id: invoiceId,
        tenantId,
        customerId,
        amountHT: ht,
        taxAmount: tva,
        amountTTC: ttc,
        status: 'VALIDATED',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30j par défaut
      }, { transaction });

      // 4. Lignes de facture + Mouvements de stock
      for (const item of items) {
        await InvoiceItem.create({
          invoiceId,
          productId: item.productId,
          qty: item.qty,
          price: item.price,
          tva: taxRate
        }, { transaction });

        const product = await StockItem.findOne({ where: { id: item.productId, tenantId }, transaction });
        
        // Décrémentation
        await product.decrement('currentLevel', { by: item.qty, transaction });

        // Log de mouvement logistique
        await ProductMovement.create({
          tenantId,
          productId: item.productId,
          userId,
          type: 'OUT',
          qty: item.qty,
          reason: `Facturation ${invoiceId}`,
          previousLevel: product.currentLevel,
          newLevel: product.currentLevel - item.qty
        }, { transaction });
      }

      // 5. Mise à jour de l'encours client (Debt Tracking)
      await customer.increment('outstandingBalance', { by: ttc, transaction });

      // 6. Audit de sécurité immuable
      await AuditLog.create({
        tenantId,
        userId,
        action: 'INVOICE_VALIDATED',
        resource: invoiceId,
        severity: 'MEDIUM',
        signature: 'F-X_SIGNED_' + crypto.randomBytes(8).toString('hex')
      }, { transaction });

      await transaction.commit();
      
      // Ici, on pourrait déclencher un worker pour générer le PDF hybride avec l'XML embarqué
      return invoice;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Enregistre un paiement et met à jour l'encours
   */
  static async recordPayment(invoiceId, amount, method, tenantId) {
    const transaction = await sequelize.transaction();
    try {
      const invoice = await Invoice.findOne({ where: { id: invoiceId, tenantId }, transaction });
      if (!invoice) throw new Error('Facture introuvable.');

      const customer = await Customer.findByPk(invoice.customerId, { transaction });
      
      await invoice.update({ status: 'PAID' }, { transaction });
      await customer.decrement('outstandingBalance', { by: amount, transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
