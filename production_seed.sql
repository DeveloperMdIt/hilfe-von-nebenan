INSERT INTO users (id, email, full_name, role, password, is_verified, trust_level)
VALUES (gen_random_uuid(), 'michael.deja@md-it-solutions.de', 'Michael Deja', 'admin', 'password', true, 1)
ON CONFLICT (email) 
DO UPDATE SET role = 'admin', password = 'password';
