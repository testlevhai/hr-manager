CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE employment_type AS ENUM ('Full Time', 'Part Time', 'Contractor');

CREATE TYPE employment_status AS ENUM ('Active', 'On Leave', 'Terminated');

CREATE TYPE timeline_event_type AS ENUM (
  'Performance Review',
  'HR Meeting',
  'Salary Discussion',
  'Warning',
  'Promotion',
  'General Note'
);

CREATE TABLE departments (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE users (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  google_sub text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE employees (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  date_of_birth date NOT NULL,
  job_title text NOT NULL,
  department_id int NOT NULL REFERENCES departments (id),
  manager_id int REFERENCES employees (id) ON DELETE SET NULL,
  start_date date NOT NULL,
  employment_type employment_type NOT NULL,
  employment_status employment_status NOT NULL,
  salary numeric(12, 2) NOT NULL CHECK (salary >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employees_manager_not_self CHECK (manager_id IS DISTINCT FROM id)
);

CREATE TABLE timeline_entries (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id int NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
  author_user_id int NOT NULL REFERENCES users (id),
  event_type timeline_event_type NOT NULL,
  event_date date NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX employees_department_id_idx ON employees (department_id);

CREATE INDEX employees_manager_id_idx ON employees (manager_id);

CREATE INDEX employees_name_idx ON employees (last_name, first_name);

CREATE INDEX employees_full_name_trgm_idx ON employees
  USING gin (lower(first_name || ' ' || last_name) gin_trgm_ops);

CREATE INDEX timeline_entries_employee_event_date_idx ON timeline_entries (employee_id, event_date DESC, id DESC);

CREATE INDEX timeline_entries_author_user_id_idx ON timeline_entries (author_user_id);
