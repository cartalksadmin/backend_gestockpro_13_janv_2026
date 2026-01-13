
import { Customer, Invoice, AuditLog } from '../models/index.js';
import { sequelize } from '../config/database.js';

export class CustomerController {
  /**
   * Liste des clients avec filtres de segmentation
   */
  static async list(req, res) {
    try {
      const { status, health } = req.query;
      const where = { tenantId: req.user.tenantId };
      
      if (status) where.isActive = status === 'active';
      if (health) where.healthStatus = health;

      const customers = await Customer.findAll({
        where,
        order: [['companyName', 'ASC']]
      });
      return res.status(200).json(customers);
    } catch (error) {
      return res.status(500).json({ error: 'ListError', message: error.message });
    }
  }

  /**
   * Vue 360° d'un client (Détails + Stats)
   */
  static async getDetails(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.findOne({ 
        where: { id, tenantId: req.user.tenantId }
      });
      
      if (!customer) return res.status(404).json({ error: 'NotFound', message: 'Client introuvable.' });

      // Récupération des dernières factures pour analyse
      const invoices = await Invoice.findAll({ 
        where: { customerId: id },
        limit: 10,
        order: [['createdAt', 'DESC']]
      });

      const totalInvoiced = await Invoice.sum('amount', { where: { customerId: id } }) || 0;
      const totalPaid = await Invoice.sum('amount', { where: { customerId: id, status: 'PAID' } }) || 0;

      return res.status(200).json({
        customer,
        stats: {
          totalInvoiced,
          totalPaid,
          outstanding: totalInvoiced - totalPaid,
          invoiceCount: invoices.length
        },
        recentInvoices: invoices
      });
    } catch (error) {
      return res.status(500).json({ error: 'DetailError', message: error.message });
    }
  }

  /**
   * Création d'un client avec audit
   */
  static async create(req, res) {
    try {
      const customer = await Customer.create({
        ...req.body,
        tenantId: req.user.tenantId
      });

      await AuditLog.create({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: 'CUSTOMER_CREATED',
        resource: customer.id,
        severity: 'LOW',
        signature: 'CRM_AUTH_' + Date.now()
      });

      return res.status(201).json(customer);
    } catch (error) {
      return res.status(400).json({ error: 'CreateError', message: error.message });
    }
  }

  /**
   * Mise à jour avec protection des données sensibles
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.findOne({ where: { id, tenantId: req.user.tenantId } });
      
      if (!customer) return res.status(404).json({ error: 'NotFound', message: 'Client introuvable.' });

      // Détecter si des champs critiques (IBAN/Conditions) changent
      const criticalFields = ['maxCreditLimit', 'paymentTerms', 'companyName'];
      const hasCriticalChange = criticalFields.some(field => req.body[field] !== undefined && req.body[field] !== customer[field]);

      await customer.update(req.body);

      if (hasCriticalChange) {
        await AuditLog.create({
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: 'CUSTOMER_CRITICAL_UPDATE',
          resource: id,
          severity: 'MEDIUM',
          signature: 'CRM_SECURE_SIG'
        });
      }

      return res.status(200).json(customer);
    } catch (error) {
      return res.status(400).json({ error: 'UpdateError', message: error.message });
    }
  }
}
