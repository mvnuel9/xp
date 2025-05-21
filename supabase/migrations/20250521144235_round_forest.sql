/*
  # Fix Authentication and RLS Setup

  1. Tables
    - Create profiles table for user data
    - Create franchises table for franchise management
    - Create user_franchises table for user-franchise relationships
  
  2. Security
    - Enable RLS on all tables
    - Set up proper policies for profiles table
    - Set up proper policies for franchises table
    - Set up proper policies for user_franchises table without recursion
    
  3. Changes
    - Fixes infinite recursion in user_franchises policies
    - Ensures proper authentication flow
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  email text,
  role text,
  profile_url text,
  created_at timestamptz DEFAULT now()
);

-- Create franchises table if it doesn't exist
CREATE TABLE IF NOT EXISTS franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
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

-- Create initial admin user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@eaglexpert.com'
  ) THEN
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role
    ) VALUES (
      'admin@eaglexpert.com',
      crypt('password', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin User"}',
      now(),
      now(),
      'authenticated'
    );

    INSERT INTO profiles (
      id,
      name,
      email,
      role
    ) VALUES (
      (SELECT id FROM auth.users WHERE email = 'admin@eaglexpert.com'),
      'Admin User',
      'admin@eaglexpert.com',
      'admin'
    );
  END IF;
END $$;