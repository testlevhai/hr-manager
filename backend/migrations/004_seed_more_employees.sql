INSERT INTO employees (
  first_name, last_name, email, phone, date_of_birth, job_title,
  department_id, start_date, employment_type, employment_status, salary
)
VALUES
  ('Omer', 'Katz', 'omer.katz@example.com', '+972501230001', '1992-01-17', 'DevOps Engineer',
   (SELECT id FROM departments WHERE name = 'R&D'), '2022-02-14', 'Full Time', 'Active', 28000),
  ('Hila', 'Shani', 'hila.shani@example.com', '+972501230002', '1996-08-23', 'QA Engineer',
   (SELECT id FROM departments WHERE name = 'R&D'), '2023-11-06', 'Full Time', 'Active', 21500),
  ('Ariel', 'Tal', 'ariel.tal@example.com', '+972501230003', '1988-05-09', 'Data Engineer',
   (SELECT id FROM departments WHERE name = 'R&D'), '2020-07-13', 'Part Time', 'On Leave', 30000),
  ('Gil', 'Harari', 'gil.harari@example.com', '+972501230004', '1994-12-01', 'Account Executive',
   (SELECT id FROM departments WHERE name = 'Sales'), '2023-03-20', 'Full Time', 'Active', 20000),
  ('Inbal', 'Rosen', 'inbal.rosen@example.com', '+972501230005', '1991-03-28', 'Sales Operations Analyst',
   (SELECT id FROM departments WHERE name = 'Sales'), '2021-10-04', 'Full Time', 'Active', 22500),
  ('Yuval', 'Baron', 'yuval.baron@example.com', '+972501230006', '1998-09-15', 'Logistics Coordinator',
   (SELECT id FROM departments WHERE name = 'Operations'), '2024-01-08', 'Contractor', 'Active', 16000),
  ('Sivan', 'Doron', 'sivan.doron@example.com', '+972501230007', '1987-11-11', 'Facilities Lead',
   (SELECT id FROM departments WHERE name = 'Operations'), '2019-09-02', 'Full Time', 'Active', 23000),
  ('Oren', 'Hadad', 'oren.hadad@example.com', '+972501230008', '1995-06-19', 'Financial Analyst',
   (SELECT id FROM departments WHERE name = 'Finance'), '2022-12-05', 'Full Time', 'Active', 24000),
  ('Tamar', 'Ben-David', 'tamar.bendavid@example.com', '+972501230009', '1993-04-02', 'Content Strategist',
   (SELECT id FROM departments WHERE name = 'Marketing'), '2023-08-21', 'Part Time', 'Active', 18500),
  ('Nadav', 'Elbaz', 'nadav.elbaz@example.com', '+972501230010', '2000-02-26', 'Support Specialist',
   (SELECT id FROM departments WHERE name = 'Customer Service'), '2025-01-13', 'Full Time', 'Terminated', 15000)
ON CONFLICT (email) DO NOTHING;

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'dana.levi@example.com')
WHERE email IN ('omer.katz@example.com', 'hila.shani@example.com', 'ariel.tal@example.com');

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'tomer.azoulay@example.com')
WHERE email IN ('gil.harari@example.com', 'inbal.rosen@example.com');

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'avi.mizrahi@example.com')
WHERE email IN ('yuval.baron@example.com', 'sivan.doron@example.com');

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'shira.golan@example.com')
WHERE email = 'oren.hadad@example.com';

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'rotem.shaked@example.com')
WHERE email = 'nadav.elbaz@example.com';
