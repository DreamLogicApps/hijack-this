-- Create the current_link table
CREATE TABLE IF NOT EXISTS current_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    label TEXT NOT NULL,
    hijack_price FLOAT NOT NULL,
    owner_name TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE current_link ENABLE ROW LEVEL SECURITY;

-- Allow public read access to everyone
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access' AND tablename = 'current_link'
    ) THEN
        CREATE POLICY "Allow public read access" ON current_link FOR SELECT TO public USING (true);
    END IF;
END $$;

-- Create the hijack_history table
CREATE TABLE IF NOT EXISTS hijack_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    label TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    price_paid FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for hijack_history
ALTER TABLE hijack_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access to hijack_history
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access' AND tablename = 'hijack_history'
    ) THEN
        CREATE POLICY "Allow public read access" ON hijack_history FOR SELECT TO public USING (true);
    END IF;
END $$;

-- Insert initial seed data if current_link is empty
INSERT INTO current_link (url, label, hijack_price, owner_name)
SELECT 'https://youtube.com', 'The Internet''s Forgotten Scraps', 5.00, 'System Admin'
WHERE NOT EXISTS (SELECT 1 FROM current_link);

-- Insert initial seed record into hijack_history if empty
INSERT INTO hijack_history (url, label, owner_name, price_paid)
SELECT 'https://youtube.com', 'The Internet''s Forgotten Scraps', 'System Admin', 5.00
WHERE NOT EXISTS (SELECT 1 FROM hijack_history);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE current_link;
ALTER PUBLICATION supabase_realtime ADD TABLE hijack_history;
