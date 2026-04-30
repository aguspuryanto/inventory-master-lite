import { Router } from 'express';
import { db } from '../../services/db';

const router = Router();

// GET /api/store-settings - Get store settings
router.get('/', async (req, res) => {
  try {
    const storeId = req.query.storeId;
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        error: 'StoreId is required'
      });
    }
    
    const settings = await db.getStoreSettings(storeId as string);
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store settings'
    });
  }
});

// PUT /api/store-settings - Update store settings
router.put('/', async (req, res) => {
  try {
    const { settings, storeId } = req.body;
    
    if (!settings || !storeId) {
      return res.status(400).json({
        success: false,
        error: 'Settings data and storeId are required'
      });
    }
    
    // Note: You'll need to implement updateStoreSettings in your db service
    // For now, we'll return a mock response
    res.json({
      success: true,
      data: { ...settings, store_id: storeId },
      message: 'Store settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update store settings'
    });
  }
});

export default router;
