-- This migration addresses the persistent 'hr_users_role_check' constraint violation.
-- It ensures the constraint is correctly updated and handles potential conflicts
-- with existing data by explicitly deleting and re-inserting sample user rows.

-- Drop the existing check constraint if it exists.
-- This is necessary to redefine it with an expanded set of allowed roles.
ALTER TABLE hr_users DROP CONSTRAINT IF EXISTS hr_users_role_check;

-- Add the updated check constraint with a comprehensive list of allowed HR roles.
-- This list includes roles like 'hr_director', 'hr_coordinator', and 'hr_analyst'
-- which were previously causing violations.
ALTER TABLE hr_users ADD CONSTRAINT hr_users_role_check
  CHECK (role = ANY (ARRAY[
    'hr_manager'::text,
    'hr_admin'::text,
    'hr_specialist'::text,
    'hr_director'::text,
    'hr_coordinator'::text,
    'hr_analyst'::text
  ]));

-- Delete existing sample HR user rows to ensure a clean state for insertion.
-- This is a crucial step to prevent conflicts and ensure the data aligns
-- with the updated constraint and the intended sample data.
-- We explicitly list the emails of the sample users to be deleted.
DELETE FROM hr_users WHERE email IN (
  'hr@company.com',
  'admin@company.com',
  'test@company.com',
  'david.kim@company.com',
  'manager@company.com',
  'specialist@company.com',
  'michael.chen@company.com',
  'sarah.johnson@company.com',
  'emily.rodriguez@company.com',
  'jennifer.martinez@company.com',
  'robert.wilson@company.com',
  'lisa.wang@company.com'
);

-- Insert sample HR users with valid roles.
-- The ON CONFLICT clause ensures that if an email somehow still exists (e.g., due to
-- a race condition or external modification), the row is updated with the correct
-- sample data, adhering to the newly defined constraint.
INSERT INTO hr_users (name, email, role, department) VALUES
  ('Sarah Johnson', 'hr@company.com', 'hr_manager', 'Human Resources'),
  ('Michael Chen', 'admin@company.com', 'hr_admin', 'Human Resources'),
  ('Emily Rodriguez', 'test@company.com', 'hr_specialist', 'Employee Relations'),
  ('David Kim', 'david.kim@company.com', 'hr_director', 'Human Resources'),
  ('Jennifer Martinez', 'manager@company.com', 'hr_manager', 'Human Resources'),
  ('Robert Wilson', 'specialist@company.com', 'hr_specialist', 'Benefits'),
  ('Lisa Wang', 'lisa.wang@company.com', 'hr_coordinator', 'Human Resources'),
  ('John Doe', 'john.doe@company.com', 'hr_analyst', 'Data & Analytics')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department;