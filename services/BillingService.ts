
import { Invoice } from '../models/Invoice';

export class BillingService {
  static async generateInvoiceNumber(tenantId: string) {
    const count = await (Invoice as any).count({ where: { tenantId } });
    const year = new Date().getFullYear();
    return `INV-${year}-${(count + 1).toString().padStart(5, '0')}`;
  }

  static calculateTotals(items: any[]) {
    const ht = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const tva = items.reduce((sum, i) => sum + (i.price * i.qty * (i.tva / 100)), 0);
    return { ht, tva, ttc: ht + tva };
  }
}
