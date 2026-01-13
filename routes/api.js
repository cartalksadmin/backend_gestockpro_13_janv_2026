
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.js';
import { tenantIsolation } from '../middlewares/tenant.js';
import { checkPermission } from '../middlewares/rbac.js';

import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import stockRoutes from './stock.routes.js';
import salesRoutes from './sales.routes.js';
import customerRoutes from './customers.routes.js';
import billingRoutes from './billing.routes.js';
import aiRoutes from './ai.routes.js';
import financeRoutes from './finance.routes.js';
import documentRoutes from './document.routes.js';
import resilienceRoutes from './resilience.routes.js';
import { TenantController } from '../controllers/TenantController.js';
import { SubscriptionController } from '../controllers/SubscriptionController.js';

const router = Router();

// --- ROUTES PUBLIQUES (Ouvertes sans Token) ---
router.use('/auth', authRoutes);
router.get('/plans', SubscriptionController.listPlans); // Route critique pour l'inscription

// --- PROTECTION JWT (Toutes les routes suivantes nécessitent un login) ---
router.use(authenticateJWT);

router.use('/admin', adminRoutes);
router.use('/stock', tenantIsolation, stockRoutes);
router.use('/sales', tenantIsolation, salesRoutes);
router.use('/customers', tenantIsolation, customerRoutes);
router.use('/billing', tenantIsolation, billingRoutes);
router.use('/ai', tenantIsolation, aiRoutes);
router.use('/finance', tenantIsolation, financeRoutes);
router.use('/documents', tenantIsolation, documentRoutes);
router.use('/resilience', tenantIsolation, resilienceRoutes);

router.get('/settings', tenantIsolation, checkPermission(['ADMIN']), TenantController.getSettings);
router.put('/settings', tenantIsolation, checkPermission(['ADMIN']), TenantController.updateSettings);

export default router;
