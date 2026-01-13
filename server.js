
import express from 'express';
import path from 'path';
import cors from 'cors';
import { connectDB } from './config/database.js';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Middlewares de base
app.use(cors());
app.use(express.json());

// Routes API v1
// Use raw body for payment webhooks (Stripe requires raw body to verify signature)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use('/api', apiRoutes);

// Serve uploaded files (fallback local storage)
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));

// Health Check
app.get('/health', (req, res) => res.send('GeStockPro Kernel Online'));

// Gestionnaire d'erreurs (doit être en dernier)
app.use(errorHandler);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 GeStockPro API running on http://localhost:${PORT}`);
});
