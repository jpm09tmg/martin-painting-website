-- Enable Row Level Security on admin_profile table
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
-- This allows admins to insert, update, select, and delete their profile
CREATE POLICY "Allow all operations for admin users" ON admin_profile
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternative: More restrictive policies (commented out)
-- Uncomment these if you want more granular control

-- Policy: Allow SELECT for everyone
-- CREATE POLICY "Allow public read access" ON admin_profile
--   FOR SELECT
--   USING (true);

-- Policy: Allow INSERT for authenticated users
-- CREATE POLICY "Allow authenticated insert" ON admin_profile
--   FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow UPDATE for authenticated users
-- CREATE POLICY "Allow authenticated update" ON admin_profile
--   FOR UPDATE
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow DELETE for authenticated users
-- CREATE POLICY "Allow authenticated delete" ON admin_profile
--   FOR DELETE
--   USING (auth.role() = 'authenticated');
