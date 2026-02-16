INSERT INTO settings (key, value) VALUES ('zip_activation_threshold', '1') ON CONFLICT (key) DO UPDATE SET value = '1';
