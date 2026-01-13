
import { sequelize } from '../config/database';
import { StockItem } from '../models/StockItem';
import { Invoice } from '../models/Invoice';
import { InvoiceItem } from '../models/InvoiceItem';

export class InvoiceService {
  static async createValidatedInvoice(tenantId: string, customerId: string, items: any[]) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Validation Pré-vol du Stock (Vérification atomique)
      for (const item of items) {
        const product = await (StockItem as any).findOne({ 
          where: { id: item.productId, tenantId },
          transaction
        });

        if (!product || product.currentLevel < item.qty) {
          throw new Error(`Stock insuffisant : ${item.name || item.productId}`);
        }
      }

      // 2. Calcul du montant total
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

      // 3. Création de la Facture
      const invoiceId = `INV-${Date.now()}`;
      const invoice = await (Invoice as any).create({
        id: invoiceId,
        tenantId,
        customerId,
        amount: totalAmount,
        status: 'VALIDATED'
      }, { transaction });

      // 4. Création des lignes et mise à jour stock
      for (const item of items) {
        await (InvoiceItem as any).create({
          invoiceId,
          productId: item.productId,
          qty: item.qty,
          price: item.price
        }, { transaction });

        await (StockItem as any).decrement('currentLevel', {
          by: item.qty,
          where: { id: item.productId, tenantId },
          transaction
        });
      }

      await transaction.commit();
      return invoice;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
