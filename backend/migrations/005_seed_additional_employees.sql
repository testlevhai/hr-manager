INSERT INTO employees (
  first_name, last_name, email, phone, date_of_birth, job_title,
  department_id, start_date, employment_type, employment_status, salary
)
VALUES
  ('Daniel', 'Ohana', 'daniel.ohana@example.com', '+972501230011', '1997-07-04', 'Mobile Engineer',
   (SELECT id FROM departments WHERE name = 'R&D'), '2024-04-15', 'Full Time', 'Active', 25000),
  ('Roi', 'Salem', 'roi.salem@example.com', '+972501230012', '1990-10-22', 'Payroll Specialist',
   (SELECT id FROM departments WHERE name = 'Finance'), '2021-06-28', 'Full Time', 'Active', 20500),
  ('Michal', 'Adler', 'michal.adler@example.com', '+972501230013', '1992-12-14', 'Growth Marketer',
   (SELECT id FROM departments WHERE name = 'Marketing'), '2022-05-09', 'Full Time', 'Active', 23500),
  ('Efrat', 'Nissim', 'efrat.nissim@example.com', '+972501230014', '1999-01-31', 'Support Specialist',
   (SELECT id FROM departments WHERE name = 'Customer Service'), '2024-09-16', 'Part Time', 'On Leave', 14500),
  ('Amit', 'Zohar', 'amit.zohar@example.com', '+972501230015', '1986-08-07', 'Procurement Officer',
   (SELECT id FROM departments WHERE name = 'Operations'), '2020-02-24', 'Contractor', 'Active', 19500)
ON CONFLICT (email) DO NOTHING;

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'dana.levi@example.com')
WHERE email = 'daniel.ohana@example.com';

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'shira.golan@example.com')
WHERE email = 'roi.salem@example.com';

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'rotem.shaked@example.com')
WHERE email = 'efrat.nissim@example.com';

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'avi.mizrahi@example.com')
WHERE email = 'amit.zohar@example.com';
