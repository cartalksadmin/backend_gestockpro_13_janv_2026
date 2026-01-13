
import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { checkRole } from '../middlewares/rbac';
// Fixed: Using tenantIsolation instead of non-existent tenantContext
import { tenantIsolation } from '../middlewares/tenant';

const router = Router();

router.get('/plans', SubscriptionController.listPlans as any);

// Fixed: Using tenantIsolation instead of non-existent tenantContext
router.use(tenantIsolation as any);
router.post('/subscribe', checkRole(['ADMIN']), SubscriptionController.subscribe as any);

export default router;