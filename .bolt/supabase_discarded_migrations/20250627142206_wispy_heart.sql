/*
  # Fix HR Users Role Constraint

  1. Updates
    - Expand hr_users role check constraint to include more role types
    - Add sample HR users with valid roles
  
  2. Security
    - Maintains existing RLS policies
    - Ensures proper role validation
*/

-- Update the check constraint to allow more role types
ALTER TABLE hr_users DROP CONSTRAINT IF EXISTS hr_users_role_check;

-- Add updated constraint with more role options
ALTER TABLE hr_users ADD CONSTRAINT hr_users_role_check 
  CHECK (role = ANY (ARRAY[
    'hr_manager'::text, 
    'hr_admin'::text, 
    'hr_specialist'::text,
    'hr_director'::text,
    'hr_coordinator'::text,
    'hr_analyst'::text
  ]));

-- Insert sample HR users with valid roles
INSERT INTO hr_users (name, email, role, department) VALUES
  ('Sarah Johnson', 'hr@company.com', 'hr_manager', 'Human Resources'),
  ('Michael Chen', 'admin@company.com', 'hr_admin', 'Human Resources'),
  ('Emily Rodriguez', 'test@company.com', 'hr_specialist', 'Employee Relations'),
  ('David Kim', 'david.kim@company.com', 'hr_director', 'Human Resources'),
  ('Jennifer Martinez', 'manager@company.com', 'hr_manager', 'Human Resources'),
  ('Robert Wilson', 'specialist@company.com', 'hr_specialist', 'Benefits')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department;