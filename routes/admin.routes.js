
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { checkRole } from '../middlewares/rbac.js';

const router = Router();

router.get('/stats', checkRole(['SUPER_ADMIN']), AdminController.getGlobalStats);
router.post('/tenants/:id/toggle', checkRole(['SUPER_ADMIN']), AdminController.toggleTenantStatus);

export default router;
