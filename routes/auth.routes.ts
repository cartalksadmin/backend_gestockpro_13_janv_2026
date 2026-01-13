
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/login', AuthController.login as any);
// Route privée pour le profil ou MFA
router.get('/me', authenticateJWT as any, (req: any, res) => {
  res.json(req.user);
});

export default router;
