import { Router } from 'express';
import productsRoutes from './routes/products';
import transactionsRoutes from './routes/transactions';
import storeSettingsRoutes from './routes/store-settings';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EzyKasir API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
router.use('/products', productsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/store-settings', storeSettingsRoutes);

// 404 handler for unknown API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

export default router;
