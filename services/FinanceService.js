
import { Invoice, Customer } from '../models/index.js';
import { Op, fn, col } from 'sequelize';

export class FinanceService {
  /**
   * Calcule le CA et la trésorerie sur une période donnée
   */
  static async getCashFlowSummary(tenantId, startDate, endDate) {
    const invoices = await Invoice.findAll({
      where: {
        tenantId,
        invoiceDate: { [Op.between]: [startDate, endDate] }
      }
    });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amountTTC, 0);
    const totalCollected = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amountTTC, 0);

    return {
      totalInvoiced,
      totalCollected,
      outstanding: totalInvoiced - totalCollected,
      collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0
    };
  }

  /**
   * Identifie les "Top Clients" par volume d'affaires
   */
  static async getTopCustomers(tenantId, limit = 5) {
    return await Invoice.findAll({
      where: { tenantId },
      attributes: [
        'customerId',
        [fn('SUM', col('amountTTC')), 'totalAmount']
      ],
      include: [{ model: Customer, attributes: ['companyName'] }],
      group: ['customerId', 'customer.id'],
      order: [[col('totalAmount'), 'DESC']],
      limit
    });
  }
}
