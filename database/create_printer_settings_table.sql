-- Create printer_settings table
CREATE TABLE IF NOT EXISTS printer_settings (
  id TEXT PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  default_printer TEXT,
  paper_size TEXT DEFAULT '58mm',
  orientation TEXT DEFAULT 'Portrait',
  auto_print_after_transaction BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE printer_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for simplicity, adjust as needed)
CREATE POLICY "Allow all printer settings operations" ON printer_settings
  FOR ALL USING (true);

-- Insert default settings if they don't exist
INSERT INTO printer_settings (id, paper_size, orientation, auto_print_after_transaction)
VALUES ('00000000-0000-0000-0000-000000000001', '58mm', 'Portrait', false)
ON CONFLICT (id) DO NOTHING;
