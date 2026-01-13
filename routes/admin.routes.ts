
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { checkRole } from '../middlewares/rbac';

const router = Router();

router.get('/stats', checkRole(['SUPER_ADMIN']), AdminController.getGlobalStats as any);
router.post('/tenants/:id/toggle', checkRole(['SUPER_ADMIN']), AdminController.toggleTenantStatus as any);

export default router;
