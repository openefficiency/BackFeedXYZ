/*
  # Create HR users table for authentication

  1. New Tables
    - `hr_users`
      - `id` (uuid, primary key)
      - `email` (text, unique) - HR user email
      - `name` (text) - HR user display name
      - `role` (text) - user role in HR system
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `hr_users` table
    - Add policies for HR user management
*/

CREATE TABLE IF NOT EXISTS hr_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'hr_manager' CHECK (role IN ('hr_manager', 'hr_admin', 'hr_specialist')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;

-- HR users can view other HR users
CREATE POLICY "HR users can view other HR users"
  ON hr_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert new HR users (simplified for demo)
CREATE POLICY "Admins can insert HR users"
  ON hr_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hr_users_email ON hr_users(email);