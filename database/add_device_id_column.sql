-- Add device_id column to printer_settings table
ALTER TABLE printer_settings ADD COLUMN device_id TEXT;

-- Update existing record to have a default device_id value (optional)
UPDATE printer_settings SET device_id = '' WHERE device_id IS NULL;
