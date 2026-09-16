INSERT INTO employees (
  first_name, last_name, email, phone, date_of_birth, job_title,
  department_id, start_date, employment_type, employment_status, salary
)
VALUES
  ('Dana', 'Levi', 'dana.levi@example.com', '+972501112233', '1990-04-12', 'Head of Engineering',
   (SELECT id FROM departments WHERE name = 'R&D'), '2021-03-01', 'Full Time', 'Active', 32000),
  ('Yossi', 'Cohen', 'yossi.cohen@example.com', '+972504445566', '1995-11-30', 'Senior Frontend Engineer',
   (SELECT id FROM departments WHERE name = 'R&D'), '2023-06-15', 'Full Time', 'Active', 26000),
  ('Maya', 'Brill', 'maya.brill@example.com', '+972507778899', '1993-02-08', 'Backend Engineer',
   (SELECT id FROM departments WHERE name = 'R&D'), '2022-09-04', 'Full Time', 'On Leave', 24500),
  ('Tomer', 'Azoulay', 'tomer.azoulay@example.com', '+972521234567', '1986-07-21', 'Sales Director',
   (SELECT id FROM departments WHERE name = 'Sales'), '2019-01-20', 'Full Time', 'Active', 38000),
  ('Noa', 'Feldman', 'noa.feldman@example.com', '+972522345678', '1997-05-14', 'Account Executive',
   (SELECT id FROM departments WHERE name = 'Sales'), '2024-02-11', 'Full Time', 'Active', 19000),
  ('Avi', 'Mizrahi', 'avi.mizrahi@example.com', '+972533456789', '1984-12-03', 'Operations Manager',
   (SELECT id FROM departments WHERE name = 'Operations'), '2018-05-07', 'Full Time', 'Active', 29000),
  ('Shira', 'Golan', 'shira.golan@example.com', '+972544567890', '1991-09-27', 'Financial Controller',
   (SELECT id FROM departments WHERE name = 'Finance'), '2020-11-16', 'Part Time', 'Active', 27500),
  ('Eitan', 'Peretz', 'eitan.peretz@example.com', '+972545678901', '1989-03-19', 'Marketing Manager',
   (SELECT id FROM departments WHERE name = 'Marketing'), '2021-08-02', 'Full Time', 'Terminated', 25000),
  ('Rotem', 'Shaked', 'rotem.shaked@example.com', '+972556789012', '1994-06-30', 'Support Lead',
   (SELECT id FROM departments WHERE name = 'Customer Service'), '2022-04-25', 'Full Time', 'Active', 21000),
  ('Liat', 'Berger', 'liat.berger@example.com', '+972557890123', '1999-10-05', 'Support Specialist',
   (SELECT id FROM departments WHERE name = 'Customer Service'), '2024-07-08', 'Contractor', 'Active', 15500)
ON CONFLICT (email) DO NOTHING;

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'dana.levi@example.com')
WHERE email IN ('yossi.cohen@example.com', 'maya.brill@example.com');

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'tomer.azoulay@example.com')
WHERE email = 'noa.feldman@example.com';

UPDATE employees
SET manager_id = (SELECT id FROM employees WHERE email = 'rotem.shaked@example.com')
WHERE email = 'liat.berger@example.com';
