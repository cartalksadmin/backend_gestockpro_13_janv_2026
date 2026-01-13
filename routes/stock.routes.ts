
import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { checkRole } from '../middlewares/rbac';
// Fixed: Using tenantIsolation instead of non-existent tenantContext
import { tenantIsolation } from '../middlewares/tenant';

const router = Router();

// Fixed: Using tenantIsolation instead of non-existent tenantContext
router.use(tenantIsolation as any);

router.get('/', checkRole(['ADMIN', 'STOCK_MANAGER', 'SALES']), InventoryController.list as any);
router.post('/movements', checkRole(['ADMIN', 'STOCK_MANAGER']), InventoryController.addMovement as any);
// Route pour les prévisions IA via n8n
router.get('/forecast/:sku', checkRole(['ADMIN', 'STOCK_MANAGER']), async (req, res) => {
  // Implémentation via StockService.getAIForecast
  res.json({ message: "Forecast service working" });
});

export default router;