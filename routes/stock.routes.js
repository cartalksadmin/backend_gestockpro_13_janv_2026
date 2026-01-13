
import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController.js';
import { checkRole } from '../middlewares/rbac.js';

const router = Router();

// Lecture accessible à la logistique, aux ventes et à la compta
router.get('/', checkRole(['ADMIN', 'STOCK_MANAGER', 'SALES', 'ACCOUNTANT']), InventoryController.list);

// Création d'article : Admin ou Gestionnaire de stock
router.post('/', checkRole(['ADMIN', 'STOCK_MANAGER']), InventoryController.createItem);

// Mouvements de stock : Admin ou Gestionnaire de stock
router.post('/movements', checkRole(['ADMIN', 'STOCK_MANAGER']), InventoryController.addMovement);

// Sync IA : Généralement appelé par un service tokenisé ou l'Admin
router.post('/ai-sync', checkRole(['ADMIN']), InventoryController.syncAIPredictions);

export default router;
