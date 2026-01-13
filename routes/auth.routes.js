
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticateJWT } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/rbac.js';

const router = Router();

// --- ROUTES PUBLIQUES ---
/**
 * @route POST /api/auth/login
 * @desc  Authentification utilisateur et retour JWT
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/register
 * @desc  Création d'une nouvelle entreprise (Tenant) + Administrateur
 */
router.post('/register', AuthController.register);

// --- ROUTES PROTÉGÉES (IAM) ---
// Nécessite un JWT valide pour toutes les routes ci-dessous
router.use(authenticateJWT);

/**
 * @route GET /api/auth/me
 * @desc  Récupère les informations de l'utilisateur connecté (depuis le token)
 */
router.get('/me', (req, res) => res.json(req.user));

/**
 * GESTION DES UTILISATEURS DU TENANT (RBAC: ADMIN REQUIS)
 * L'isolation est garantie car le controller filtre par req.user.tenantId
 */
router.get('/users', checkRole(['ADMIN']), AuthController.listUsers);
router.post('/users', checkRole(['ADMIN']), AuthController.createUser);
router.put('/users/:id', checkRole(['ADMIN']), AuthController.updateUser);
router.delete('/users/:id', checkRole(['ADMIN']), AuthController.deleteUser);

export default router;
