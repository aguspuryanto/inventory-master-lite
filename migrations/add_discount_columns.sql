-- Migration: Add discount columns to transactions table
-- Created: 2025-04-18
-- Purpose: Add discount tracking functionality to transactions

-- PostgreSQL version for Supabase
ALTER TABLE transactions 
ADD COLUMN discount DECIMAL(5,2) DEFAULT 0,
ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN transactions.discount IS 'Discount percentage applied to transaction (0-100)';
COMMENT ON COLUMN transactions.discount_amount IS 'Total discount amount in currency';

-- Create index for better query performance on discount filtering
CREATE INDEX IF NOT EXISTS idx_transactions_discount ON transactions(discount);

-- SQLite version (for local development)
-- ALTER TABLE transactions 
-- ADD COLUMN discount REAL DEFAULT 0,
-- ADD COLUMN discount_amount REAL DEFAULT 0;
