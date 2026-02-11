
INSERT INTO users (id, email, full_name, role, password, is_verified, trust_level)
VALUES (gen_random_uuid(), 'admin@admin.com', 'Admin User', 'admin', 'password', true, 1)
ON CONFLICT (email) 
DO UPDATE SET role = 'admin', password = 'password';
