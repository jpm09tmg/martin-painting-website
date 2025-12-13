-- Create admin_profile table for storing admin user settings
CREATE TABLE IF NOT EXISTS admin_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  username VARCHAR(100) NOT NULL UNIQUE,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_profile_email ON admin_profile(email);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_profile_username ON admin_profile(username);

-- Add comment to table
COMMENT ON TABLE admin_profile IS 'Stores admin user profile information and settings';

-- Add comments to columns
COMMENT ON COLUMN admin_profile.id IS 'Unique identifier for the admin profile';
COMMENT ON COLUMN admin_profile.full_name IS 'Full name of the admin user';
COMMENT ON COLUMN admin_profile.position IS 'Job position or title of the admin user';
COMMENT ON COLUMN admin_profile.email IS 'Email address of the admin user (unique)';
COMMENT ON COLUMN admin_profile.phone IS 'Phone number of the admin user';
COMMENT ON COLUMN admin_profile.address IS 'Physical address of the admin user';
COMMENT ON COLUMN admin_profile.username IS 'Login username for the admin user (unique)';
COMMENT ON COLUMN admin_profile.profile_image_url IS 'URL to the admin user profile image';
COMMENT ON COLUMN admin_profile.created_at IS 'Timestamp when the profile was created';
COMMENT ON COLUMN admin_profile.updated_at IS 'Timestamp when the profile was last updated';
