import { Router } from 'express';
import { db } from '../../services/db';

const router = Router();

// GET /api/transactions - Get all transactions for a store
router.get('/', async (req, res) => {
  try {
    const storeId = req.query.storeId || null;
    const transactions = await db.getTransactions(storeId as string | null);
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

// GET /api/transactions/:id - Get a specific transaction
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.query.storeId || null;
    const transactions = await db.getTransactions(storeId as string | null);
    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction'
    });
  }
});

// POST /api/transactions - Create a new transaction
router.post('/', async (req, res) => {
  try {
    const { transaction, storeId } = req.body;
    
    if (!transaction || !storeId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction data and storeId are required'
      });
    }
    
    const result = await db.addTransaction(transaction, storeId);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  }
});

// GET /api/transactions/summary - Get transaction summary
router.get('/summary', async (req, res) => {
  try {
    const storeId = req.query.storeId || null;
    const transactions = await db.getTransactions(storeId as string | null);
    
    // Calculate summary statistics
    const totalRevenue = transactions
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'OUT')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalRevenue - totalExpenses;
    
    const today = new Date();
    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.created_at);
      return transactionDate.toDateString() === today.toDateString();
    });
    
    const todayRevenue = todayTransactions
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        todayRevenue,
        totalTransactions: transactions.length,
        todayTransactions: todayTransactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction summary'
    });
  }
});

export default router;
