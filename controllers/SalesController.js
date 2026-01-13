
import { Invoice, InvoiceItem, Customer } from '../models/index.js';
import { InvoiceService } from '../services/InvoiceService.js';

export class SalesController {
  /**
   * Liste des factures avec inclusion client
   */
  static async getInvoices(req, res) {
    try {
      const invoices = await Invoice.findAll({
        where: { tenantId: req.user.tenantId },
        include: [{ model: Customer, attributes: ['companyName', 'email'] }],
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json(invoices);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Création d'une facture via le service transactionnel
   */
  static async createInvoice(req, res) {
    try {
      const { customerId, items } = req.body;
      const tenantId = req.user.tenantId;
      const userId = req.user.id;

      const invoice = await InvoiceService.validateAndGenerate(tenantId, customerId, items, userId);
      
      return res.status(201).json({
        message: 'Facture validée et stock décrémenté.',
        invoice
      });
    } catch (error) {
      return res.status(400).json({ 
        error: 'FacturationError', 
        message: error.message 
      });
    }
  }

  /**
   * Simulation de génération Factur-X
   */
  static async downloadFacturX(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findOne({ 
        where: { id, tenantId: req.user.tenantId },
        include: [InvoiceItem]
      });

      if (!invoice) return res.status(404).json({ error: 'NotFound' });

      // Dans un vrai flux, on renverrait le PDF généré
      return res.status(200).json({
        message: 'Flux Factur-X généré.',
        metadata: {
          seller: 'GeStockPro Tenant',
          buyerId: invoice.customerId,
          totalTTC: invoice.amountTTC,
          xmlData: '<?xml version="1.0" encoding="UTF-8"?>...' // Contenu Factur-X
        }
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
