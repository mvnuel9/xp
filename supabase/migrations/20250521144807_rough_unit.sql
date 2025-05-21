/*
  # Database Schema Setup for Authentication and Franchises

  1. New Tables
    - `profiles` - User profiles linked to auth.users
    - `franchises` - Franchise information
    - `user_franchises` - Many-to-many relationship between users and franchises
  
  2. Security
    - Enable RLS on all tables
    - Set up policies for proper access control
    - Fix infinite recursion issues in policies
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  email text,
  role text,
  profile_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create franchises table if it doesn't exist
CREATE TABLE IF NOT EXISTS franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_franchises table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  franchise_id uuid REFERENCES franchises(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, franchise_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_franchises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can read franchises" ON franchises;
DROP POLICY IF EXISTS "Admin and commercial can manage franchises" ON franchises;
DROP POLICY IF EXISTS "Users can read own franchises" ON user_franchises;
DROP POLICY IF EXISTS "Admin and commercial can manage user franchises" ON user_franchises;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Franchises policies
CREATE POLICY "Anyone can read franchises"
  ON franchises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and commercial can manage franchises"
  ON franchises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'commercial')
    )
  );

-- User franchises policies (fixed to avoid recursion)
CREATE POLICY "Users can read own franchises"
  ON user_franchises
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Admin and commercial can manage user franchises"
  ON user_franchises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'commercial')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchises_updated_at
    BEFORE UPDATE ON franchises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();