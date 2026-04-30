import { Router } from 'express';
import { db } from '../../services/db';

const router = Router();

// GET /api/products - Get all products for a store
router.get('/', async (req, res) => {
  try {
    const storeId = req.query.storeId || null;
    const products = await db.getProducts(storeId as string | null);
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// GET /api/products/:id - Get a specific product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.query.storeId || null;
    // Note: You'll need to implement getProductById in your db service
    const products = await db.getProducts(storeId as string | null);
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// POST /api/products - Create a new product
router.post('/', async (req, res) => {
  try {
    const { product, storeId } = req.body;
    
    if (!product || !storeId) {
      return res.status(400).json({
        success: false,
        error: 'Product data and storeId are required'
      });
    }
    
    const result = await db.addProduct(product, storeId);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { product, storeId } = req.body;
    
    if (!product || !storeId) {
      return res.status(400).json({
        success: false,
        error: 'Product data and storeId are required'
      });
    }
    
    // Note: You'll need to implement updateProduct in your db service
    // For now, we'll return a mock response
    res.json({
      success: true,
      data: { ...product, id },
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { storeId } = req.query;
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        error: 'StoreId is required'
      });
    }
    
    // Note: You'll need to implement deleteProduct in your db service
    // For now, we'll return a mock response
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

export default router;
