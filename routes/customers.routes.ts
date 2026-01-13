
import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { checkRole } from '../middlewares/rbac';
// Fixed: Using tenantIsolation instead of non-existent tenantContext
import { tenantIsolation } from '../middlewares/tenant';

const router = Router();

// Fixed: Using tenantIsolation instead of non-existent tenantContext
router.use(tenantIsolation as any);

router.get('/', checkRole(['ADMIN', 'SALES', 'ACCOUNTANT']), CustomerController.list as any);
router.post('/', checkRole(['ADMIN', 'SALES']), CustomerController.create as any);
router.get('/:id/history', checkRole(['ADMIN', 'SALES', 'ACCOUNTANT']), async (req, res) => {
  // Logique pour l'historique client
  res.json({ message: "Customer history endpoint" });
});

export default router;