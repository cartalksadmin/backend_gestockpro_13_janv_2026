
import { Router } from 'express';
import { SalesController } from '../controllers/SalesController';
import { PaymentController } from '../controllers/PaymentController';
import { checkRole } from '../middlewares/rbac';
// Fixed: Using tenantIsolation instead of non-existent tenantContext
import { tenantIsolation } from '../middlewares/tenant';

const router = Router();

// Callback publique pour les webhooks providers
router.post('/payments/callback', PaymentController.handleWebhook as any);

// Routes sécurisées par Tenant
// Fixed: Using tenantIsolation instead of non-existent tenantContext
router.use(tenantIsolation as any);
router.get('/invoices', checkRole(['ADMIN', 'ACCOUNTANT', 'SALES']), SalesController.getInvoices as any);
router.post('/invoices', checkRole(['ADMIN', 'ACCOUNTANT', 'SALES']), SalesController.createInvoice as any);

export default router;