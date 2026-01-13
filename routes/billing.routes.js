
import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController.js';
import { checkRole } from '../middlewares/rbac.js';
import { tenantIsolation } from '../middlewares/tenant.js';

const router = Router();

router.get('/plans', SubscriptionController.listPlans);

router.use(tenantIsolation);
router.post('/subscribe', checkRole(['ADMIN']), SubscriptionController.subscribe);

export default router;
