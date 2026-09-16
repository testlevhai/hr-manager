INSERT INTO departments (name)
VALUES ('Sales'), ('R&D'), ('Operations'), ('Finance'), ('Marketing'), ('Customer Service')
ON CONFLICT (name) DO NOTHING;
