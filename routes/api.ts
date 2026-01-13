
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { tenantIsolation } from '../middlewares/tenant';

import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import stockRoutes from './stock.routes';
import salesRoutes from './sales.routes';
import customerRoutes from './customers.routes';
import billingRoutes from './billing.routes';

const router = Router();

// --- ROUTES PUBLIQUES & AUTH ---
router.use('/auth', authRoutes);

// --- MIDDLEWARE DE PROTECTION GLOBAL ---
router.use(authenticateJWT as any);

// --- MODULES SPÉCIALISÉS AVEC ISOLATION ---
// On applique l'isolation sur tous les modules métier
router.use('/admin', adminRoutes);
router.use('/stock', tenantIsolation as any, stockRoutes);
router.use('/sales', tenantIsolation as any, salesRoutes);
router.use('/customers', tenantIsolation as any, customerRoutes);
router.use('/billing', tenantIsolation as any, billingRoutes);

export default router;
