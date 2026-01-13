
import { Router } from 'express';
import { SalesController } from '../controllers/SalesController.js';
import { PaymentController } from '../controllers/PaymentController.js';
import { checkRole } from '../middlewares/rbac.js';
import { tenantIsolation } from '../middlewares/tenant.js';

const router = Router();

router.post('/payments/callback', PaymentController.handleWebhook);

router.use(tenantIsolation);
router.get('/invoices', checkRole(['ADMIN', 'ACCOUNTANT', 'SALES']), SalesController.getInvoices);
router.post('/invoices', checkRole(['ADMIN', 'ACCOUNTANT', 'SALES']), SalesController.createInvoice);

export default router;
