
import { StockItem, ProductMovement, AuditLog, User } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { NotificationService } from '../services/NotificationService.js';

export class InventoryController {
  /**
   * Liste tout le catalogue filtré par Tenant
   */
  static async list(req, res) {
    try {
      const items = await StockItem.findAll({ 
        where: { tenant_id: req.user.tenantId },
        order: [['name', 'ASC']]
      });
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Enregistre un mouvement de stock et vérifie les alertes de seuil
   */
  static async addMovement(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { productId, type, qty, reason } = req.body;
      const tenantId = req.user.tenantId;

      const product = await StockItem.findOne({ 
        where: { id: productId, tenant_id: tenantId },
        transaction
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: 'NotFound', message: 'Produit introuvable.' });
      }

      const previousLevel = product.currentLevel;
      let newLevel = previousLevel;

      if (type === 'IN') {
        newLevel += qty;
      } else if (type === 'OUT' || type === 'ADJUSTMENT') {
        if (type === 'OUT' && previousLevel < qty) {
          throw new Error('Stock insuffisant pour cette sortie.');
        }
        newLevel -= qty;
      }

      // Mise à jour du produit
      await product.update({ currentLevel: newLevel }, { transaction });

      // Création du mouvement
      const movement = await ProductMovement.create({
        stockItemId: productId,
        type,
        qty,
        reason,
        previousLevel,
        newLevel,
        userRef: req.user.name
      }, { transaction });

      // CRITICAL: Vérification du seuil d'alerte
      let alertTriggered = false;
      if (newLevel <= product.minThreshold && type !== 'IN') {
        alertTriggered = true;
        // Récupérer l'email de l'admin du tenant pour la notification
        const admin = await User.findOne({ where: { tenant_id: tenantId, role: 'ADMIN' }, transaction });
        
        if (admin) {
          // Appel asynchrone au NotificationService (via n8n)
          NotificationService.alertStockLow(
            product.name, 
            newLevel, 
            admin.email
          ).catch(err => console.error('[ALERTE-FLUX] Échec envoi notification:', err));
        }
      }

      // Enregistrement dans le journal d'audit
      await AuditLog.create({
        tenantId,
        userId: req.user.id,
        userName: req.user.name,
        action: alertTriggered ? 'STOCK_LOW_ALERT' : `STOCK_${type}`,
        resource: `Product: ${product.sku} (${product.name})`,
        status: 'SUCCESS',
        severity: alertTriggered ? 'HIGH' : 'LOW',
        sha256Signature: 'SIG_' + Math.random().toString(36).substr(2, 12).toUpperCase()
      }, { transaction });

      await transaction.commit();
      return res.status(201).json({
        movement,
        alertTriggered,
        message: alertTriggered ? `Attention: Seuil critique atteint (${newLevel} unités)` : 'Mouvement enregistré'
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ error: 'MovementError', message: error.message });
    }
  }

  /**
   * Création d'un nouvel article au catalogue
   */
  static async createItem(req, res) {
    try {
      const item = await StockItem.create({
        ...req.body,
        tenantId: req.user.tenantId
      });
      return res.status(201).json(item);
    } catch (error) {
      return res.status(400).json({ error: 'CreateError', message: error.message });
    }
  }

  /**
   * Synchronisation des prévisions IA
   */
  static async syncAIPredictions(req, res) {
    try {
      const { predictions } = req.body; 
      const tenantId = req.user.tenantId;

      for (const pred of predictions) {
        await StockItem.update(
          { forecastedLevel: pred.forecastedLevel },
          { where: { sku: pred.sku, tenant_id: tenantId } }
        );
      }

      return res.status(200).json({ message: 'Prévisions IA synchronisées.' });
    } catch (error) {
      return res.status(500).json({ error: 'AISyncError', message: error.message });
    }
  }
}
