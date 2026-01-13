
import { Tenant } from '../models/Tenant.js';
import { AuditLog } from '../models/AuditLog.js';

export class TenantController {
  /**
   * Récupère les paramètres complets du Tenant
   */
  static async getSettings(req, res) {
    try {
      const tenant = await Tenant.findByPk(req.user.tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'TenantNotFound', message: 'Instance introuvable.' });
      }
      return res.status(200).json(tenant);
    } catch (error) {
      return res.status(500).json({ error: 'InternalError', message: error.message });
    }
  }

  /**
   * Met à jour les paramètres de l'entreprise (Branding, Fiscalité, Coordonnées)
   */
  static async updateSettings(req, res) {
    try {
      const tenantId = req.user.tenantId;
      const tenant = await Tenant.findByPk(tenantId);

      if (!tenant) {
        return res.status(404).json({ error: 'NotFound', message: 'Instance introuvable.' });
      }

      const { 
        name, address, phone, email, 
        currency, taxRate, invoicePrefix, 
        legalMentions, primaryColor, 
        onboardingCompleted, logoUrl 
      } = req.body;

      // Mise à jour sélective
      await tenant.update({
        name: name || tenant.name,
        address: address !== undefined ? address : tenant.address,
        phone: phone !== undefined ? phone : tenant.phone,
        email: email !== undefined ? email : tenant.email,
        currency: currency || tenant.currency,
        taxRate: taxRate !== undefined ? taxRate : tenant.taxRate,
        invoicePrefix: invoicePrefix || tenant.invoicePrefix,
        legalMentions: legalMentions !== undefined ? legalMentions : tenant.legalMentions,
        primaryColor: primaryColor || tenant.primaryColor,
        onboardingCompleted: onboardingCompleted !== undefined ? onboardingCompleted : tenant.onboardingCompleted,
        logoUrl: logoUrl !== undefined ? logoUrl : tenant.logoUrl
      });

      // Audit de la modification des paramètres critiques
      await AuditLog.create({
        tenantId,
        userId: req.user.id,
        action: 'TENANT_SETTINGS_UPDATED',
        resource: 'Settings',
        severity: 'MEDIUM',
        signature: 'KERNEL_SIGNED_' + Date.now()
      });

      return res.status(200).json({
        message: 'Paramètres mis à jour avec succès.',
        tenant
      });
    } catch (error) {
      return res.status(500).json({ error: 'UpdateSettingsError', message: error.message });
    }
  }

  /**
   * Upload de logo (Simulation ou intégration cloud)
   */
  static async uploadLogo(req, res) {
    try {
      // Dans une implémentation réelle, nous utiliserions multer pour uploader vers S3 ou Cloudinary
      // Ici, on simule la réception d'une URL ou d'un base64
      const { logoData } = req.body;
      const tenant = await Tenant.findByPk(req.user.tenantId);
      
      await tenant.update({ logoUrl: logoData });
      
      return res.status(200).json({ message: 'Logo mis à jour', logoUrl: logoData });
    } catch (error) {
      return res.status(500).json({ error: 'UploadError', message: error.message });
    }
  }
}
