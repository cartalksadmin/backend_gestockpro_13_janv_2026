
import { Router } from 'express';
import { AIController } from '../controllers/AIController.js';
import { checkPermission } from '../middlewares/rbac.js';

const router = Router();

/**
 * @route GET /api/ai/insights
 * @desc  Récupère les recommandations IA pour le tenant
 */
router.get('/insights', checkPermission(['ADMIN', 'MANAGER']), AIController.getDashboardInsights);

/**
 * @route POST /api/ai/forecast-sync
 * @desc  Point d'entrée pour n8n pour injecter les prédictions long terme
 */
router.post('/forecast-sync', checkPermission(['ADMIN']), AIController.updateForecasts);

export default router;
