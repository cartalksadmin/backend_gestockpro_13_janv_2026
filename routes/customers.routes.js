
import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController.js';
import { checkRole } from '../middlewares/rbac.js';
import { tenantIsolation } from '../middlewares/tenant.js';

const router = Router();

router.use(tenantIsolation);

router.get('/', checkRole(['ADMIN', 'SALES', 'ACCOUNTANT']), CustomerController.list);
router.get('/:id', checkRole(['ADMIN', 'SALES', 'ACCOUNTANT']), CustomerController.getDetails);
router.post('/', checkRole(['ADMIN', 'SALES']), CustomerController.create);
router.put('/:id', checkRole(['ADMIN', 'SALES']), CustomerController.update);
router.delete('/:id', checkRole(['ADMIN']), CustomerController.delete);

export default router;
